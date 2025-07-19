import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { CustomRequest } from "../interfaces/interfacess";
import { error } from "console";

const prisma = new PrismaClient()

export const createdocument = async (req:CustomRequest, res:Response) => {

    if (!req.userId) return res.status(400).json({ error: "User not authenticated" });

    try {
        const document = await prisma.document.create({
            data: {
                userId: req.userId
            }
        })
        return res.status(200).json({message: "Document created",document})
    } catch (error) {
        console.error(error)
        return res.status(400).json({error: (error as Error).message})
    }
}

export const alldocuments = async (req:CustomRequest, res:Response) => {
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

export const deletedocument = async (req: CustomRequest, res:Response) => {
    const {documentId} = req.params

    if (!documentId) return res.status(400).json({error: "DocumentId not received"})

    try {
        const document = await prisma.document.findFirst({
            where: {
                id: Number(documentId)
            }
        })
        console.log("token", req.headers.authorization)
        console.log("documentId", documentId)
        console.log("req userid", req.userId)

        if (!document) return res.status(404).json({ error: "Document not found" })
            
        if (document?.userId != req.userId) return res.status(400).json({error: "You aren't authorized to delete"})

        await prisma.document.delete({
            where: {
                id: Number(documentId)
            }
        })
        return res.status(200).json({message: "Document deleted"})
    } catch (error: unknown) {
        if (error instanceof Error) return res.status(400).json({error:( error as Error).message})
        return res.status(400).json({ error: String(error) })
    }
}