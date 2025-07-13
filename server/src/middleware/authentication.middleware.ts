import { PrismaClient } from "@prisma/client"
import { NextFunction, Request, Response } from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { SendMail } from "../smtp-config";

export interface CustomRequest extends Request {
  userId?: Number;
  userEmail?: string
  userName?: string
}

const prisma = new PrismaClient()

export const SignupAuthetication = async (req: Request,res: Response, next: NextFunction) => {
    const {email} = req.body

    try {
        const anyuser = await prisma.user.findFirst({
        where: email
    })

    if (anyuser) res.status(409).json({error: "User with this email already exists"})
    next()

    } catch (error) {
        return res.status(500).json(error)
    }
}

export const SigninAuthetication = async (req: CustomRequest,res: Response, next: NextFunction) => {
    const {email, password} = req.body
    
    try {
        const user = await prisma.user.findFirst({
        where: email
    })
    
    if (!user) return res.status(200).json({message: "User doesnot exists"})

    if(!user.isVerified) return res.status(403).json({error: "Verify your email first"})
    
    const comparePassword = await bcrypt.compare(password,user.password)
    
    if (!comparePassword) return res.status(200).json({message: "Incorrect password"})
        
    req.userId = user.id
    req.userEmail = user.email
    next()
    } 
    catch (error) {
        console.error(error)
        return res.status(400).json({error: (error as Error).message})
    }
}

export const forgotPasswordAuthentication = async (req: CustomRequest, res:Response, next:NextFunction) => {
    const { email } = req.body
    
    try {
        const user = await prisma.user.findFirst({
            where: email
        })

    if(!user) return res.status(400).json({message: "No user with this email"})
        
    if(user.isVerified != true) return res.status(400).json({error: "Verify your email first"})
    
    req.userEmail = email
    req.userName = user.name
    next()
    } catch (error) {
        console.error(error)
        return res.status(400).json({error: (error as Error).message})
    }

}