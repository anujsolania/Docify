import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client';
import bcrypt, { compare } from "bcrypt";
import { SendMail } from "../smtp-config";
import jwt, { JwtPayload } from "jsonwebtoken";
import { CustomRequest } from "../interfaces/interfacess";

const prisma = new PrismaClient();


export const signup = async (req: Request, res:Response) => {
    const {name, email, password} = req.body
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10)

        const verificationToken = jwt.sign({email}, process.env.VERIFICATION_KEY as string,{ expiresIn: "1h" })

        const user = await prisma.user.create({
            data: {
            name,
            email,
            password: hashedPassword
        }})

        await SendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "Welcome to Docify, verify your email",
            text: `Hi ${user.name}, Please verify your email by clicking on the following link: ${process.env.LINK}/verifyemail/${verificationToken}`
        })

        return res.status(201).json({message: "User created successfully"})

    } catch (error) {
        console.error(error)
        return res.status(400).json({error: "Unable to create user",})
    }
}

export const signin = async (req: CustomRequest, res:Response) => {
    try {
    const token = jwt.sign({email: req.userEmail, userId: req.userId},process.env.JWT_KEY as string)

    return res.status(200).json({message: `Logged In successfully as ${req.userEmail}`,token})

    } catch (error) {
        console.error(error)
        return res.json({error: "Unable to login"})
    }
}

export const verifyemail = async (req: Request, res:Response) => {
    const verificationToken = req.params.verificationToken

    try {
        const decoded = jwt.verify(verificationToken,process.env.VERIFICATION_KEY as string)

        const userr = await prisma.user.findFirst({
            where: {
                email: (decoded as JwtPayload).email
            }
        })

        if (userr?.isVerified) return res.status(200).json({message: "User is already verified"})

        const user = await prisma.user.update({
            where: {
                email: (decoded as JwtPayload).email
            },
            data: {
                isVerified: true
            }
        })
        return res.status(200).json({
            verified: user.isVerified,
            message: "Email verified successfully"
        })

    } catch (error) {
        console.error(error)
        return res.status(400).json({error: "Invalid verificationToken"})
    }
}

export const forgotpassword = async (req: CustomRequest,res: Response) => {
    
    try {
        const resetPasswordToken = jwt.sign({email: req.body.email},process.env.RESETPASSWORD_KEY as string,{ expiresIn: "1h" })

        await SendMail({
        from: process.env.EMAIL,
        to: req.body.email,
        subject: "Reset your password",
        text: `Hii ${req.userName}, Please reset your password by clicking on the following link: ${process.env.LINK}/resetpassword/${resetPasswordToken}`
    })
    return res.status(200).json({message: "Reset password link sent successfully"})
    } catch (error) {
        console.error(error)
        return res.status(400).json({error: (error as Error).message})
    }  
}

export const forgotpassworddd = async (req: Request, res: Response) => {
    const resetpasswordToken = req.params.resetpasswordToken

    if (!resetpasswordToken) return res.status(400).json({error: "resetPasswordToken not received"})
    
    try {
        const decoded = jwt.verify(resetpasswordToken,process.env.RESETPASSWORD_KEY as string)

        return res.status(200).json({message: "resetPasswordToken verified successfully",email: (decoded as JwtPayload).email})
    } catch (error) {
        return res.status(400).json({error: (error as Error).message})
    }
}

export const resetpassword = async (req: Request, res:Response) => {
    const {password, confirmpassword, email} = req.body

    console.log(req.body)
    
    const existingUser = await prisma.user.findUnique({
        where: { email }, // or id, depending on what you're using
    });
    if (!existingUser) {
  return res.status(404).json({ error: "User not found" });
}

    if (password != confirmpassword) return res.status(400).json({error: "You entered different passwords"})

    const hashedPassword = await bcrypt.hash(password,10)
    
    try {
        const user = await prisma.user.update({
            where: {
                email
            },
            data: {
                password: hashedPassword
            }
        })
        return res.status(200).json({message: "Password reset successfull"})
    } catch (error) {
        console.error(error)
        res.status(400).json({error: (error as Error).message})
    }

}
