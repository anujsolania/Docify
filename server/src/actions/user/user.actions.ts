import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client';
import bcrypt, { compare } from "bcrypt";
import { SendMail } from "../../smtp-config";
import jwt, { JwtPayload } from "jsonwebtoken";
import { json } from "stream/consumers";

const prisma = new PrismaClient();


export const signup = async (req: Request, res:Response) => {
    const {name, email, password} = req.body

    const hashedPassword = await bcrypt.hash(password, 10)
    
    try {
        const verificationToken = jwt.sign({email}, process.env.VERIFICATION_KEY || "")
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
            text: `Hi ${user.name}, Please verify your email by clicking on the following link: ${process.env.LINK}/verified/${verificationToken}`
        })
        return res.status(201).json({message: "User created successfully"})
    } catch (error) {
        console.error(error)
        return res.status(400).json({error: "Unable to create user",})
    }
}

export const signin = async (req: Request, res:Response) => {
    const {email, password} = req.body

    try {
        const user = await prisma.user.findFirst({
        where: email
    })

    if (!user) return res.status(200).json({message: "User doesnot exists"})

    const comparePassword = await bcrypt.compare(password,user.password)

    if (!comparePassword) return res.status(200).json({message: "Incorrect password"})

    const token = jwt.sign({email: email, userid: user.id},process.env.JWT_KEY as string)

    return res.status(200).json({message: `Logged In successfully as ${user?.email}`,token})

    } catch (error) {
        console.error(error)
        return res.json({error: "Unable to login"})
    }
}

export const verifyemail = async (req: Request, res:Response) => {
    const verificationToken = req.params.token

    try {
        const decoded = jwt.verify(verificationToken,process.env.VERIFICATION_KEY || "")

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
        return res.status(400).json({error: "Invalid verificationToken"})
    }

}