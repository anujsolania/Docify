import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { CustomRequest } from "../interfaces/interfacess";

const prisma = new PrismaClient()

export const createdocument = async (req:CustomRequest, res:Response) => {
    const{title,content} = req.body

    if (!req.userId) return res.status(400)

    try {
        const document = await prisma.document.create({
            data: {
                title,
                content,
                userId: req.userId
            }
        })
        return res.status(200).json({message: "Document created",document})
    } catch (error) {
        console.error(error)
        return res.status(400).json({error: (error as Error).message})
    }
}

export const getdocument = async (req:Request, res:Response) => {

}