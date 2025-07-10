import { PrismaClient } from "@prisma/client"
import { NextFunction, Request, Response } from "express"

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

export const SigninAuthetication = (req: Request,res: Response, next: NextFunction) => {
    const {email, password} = req.body
}