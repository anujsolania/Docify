import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client';
import bcrypt from "bcrypt";
import { SendMail } from "../../smtp-config";
import jwt from "jsonwebtoken";

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
            subject: "Welcome to Docify",
            text: `Please click on this link to verify your email ${process.env.LINK}/verified/${verificationToken}`
        })
        return res.status(201).json({message: "User created successfully"})
    } catch (error) {
        console.error(error)
        return res.status(400).json({error: "Unable to create user",})
    }
}

export const signin = async (req: Request, res:Response) => {
    const {email, password} = req.body

    const hashedPassword = await bcrypt.hash(password, 10)


    const anyuser = await prisma.user.findFirst({
        where: email
    })

    if (anyuser) res.status(409).json({error: "User with this email already exists"})
    
    try {
       const user = await prisma.user.create({
            data: {
            // name,
            email,
            password: hashedPassword
        }})
        return res.status(201).json({message: "User created successfully"})
    } catch (error) {
        res.json({error: "Unable to create user"})
    }
}