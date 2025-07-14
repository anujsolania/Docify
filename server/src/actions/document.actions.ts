import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { CustomRequest } from "../interfaces/interfacess";
import { error } from "console";

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

export const getdocuments = async (req:CustomRequest, res:Response) => {
    try { 
        const documents = await prisma.document.findMany({
            where : {
                userId: req.userId
            }
        })
        return res.status(200).json({documents})
    } catch (error) {
        console.error(error)
        return res.status(400).json({error: (error as Error).message})
    }
}

export const searchdocuments = async (req: CustomRequest, res: Response) => {
    const {filter} = req.query

    if(!filter) return res.status(400).json({error: "search data not received"})
    
    try {
        const documents = await prisma.document.findMany({
            where: {
                userId: req.userId,
                title: {
                    contains: filter as string,
                    mode: "insensitive"
                }
            }
        })
        return res.status(200).json({documents})
    } catch (error) {
        console.error(error)
        return res.status(400).json({error: (error as Error).message})
    }
}