import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { CustomRequest } from "../interfaces/interfacess";
import { error } from "console";
import { SendMail } from "../smtp-config";

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
     const {filter} = req.query

    try { 
        if (!filter) {
        const userwithdocs = await prisma.user.findUnique({
            where: {
                id: req.userId
            },
            include: {
                documents: true,
                documentuser: {
                    include: {
                        document: true
                    }
                }
            }
        })
        const ownedbyme = userwithdocs?.documents || []
        const notownedbyme = userwithdocs?.documentuser.map((du) => du.document) || []
        const ownedbyanyone = [...ownedbyme,...notownedbyme]

        const alldocuments = {
            ownedbyme,
            notownedbyme,
            ownedbyanyone
        }
        return res.status(200).json({alldocuments}) 
        }

        console.log("filter = ",filter)
        const filtereddocuments = await prisma.document.findMany({
            where: {
                userId: req.userId,
                title: {
                    contains: filter as string,
                    mode: "insensitive"
                }
            }
        })
        return res.status(200).json({filtereddocuments})
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

export const updatedocument = async (req:Request, res:Response) => {
    const {documentId} = req.params

    const{title,content} = req.body

    if (!documentId) return res.status(400).json({error: "DocumentId not received"})

    try {
        if (!title) {
            await prisma.document.update({
            where: {
                id: Number(documentId)
            },
            data: {
                content: content
            }
        })
        return res.status(200).json({message: "Content updated"})
        }
        await prisma.document.update({
            where: {
                id: Number(documentId)
            },
            data: {
                title: title
            }
        })
        return res.status(200).json({message: "Title updated"}) 
    } catch (error: unknown) {
        console.error(error)
        if (error instanceof Error) return res.status(400).json({error:( error as Error).message})
        return res.status(400).json({ error: String(error) })
    }
}

export const getdocumentone = async (req: Request, res:Response) => {
    const {documentId} = req.params

    try {
        const document = await prisma.document.findFirst({
            where: {
                id: Number(documentId)
            }
        })
        if (!document) return res.status(400).json({error: "document not found"})

        const docUserRelation  = await prisma.documentuser.findFirst({
            where: {
                docId: Number(documentId),
                userId: (req as CustomRequest).userId
            }
        })

        const permission = docUserRelation ? docUserRelation.permission : "no permission found"

        console.log("permission =",permission)

        return res.status(200).json({document, permission})
    } catch (error) {
        console.log(error)
        return res.status(400).json({error: (error as Error).message})
    }
}

export const sharedocument = async (req: CustomRequest, res:Response) => {
    const {documentId} = req.params
    const {email,permission} = req.body

    try {
        const document = await prisma.document.findFirst({
            where: {
                id: Number(documentId)
            },
            select: {
                userId: true,
                user: true
            }
        })
        if (document?.userId != req.userId) return res.status(400).json({error: "You are not authorized to share this doc"})
        
        const user = await prisma.user.findFirst({
            where: {
                email: email
            }
        })
        if (!user) return res.status(400).json({error: "user not found"})
        
        const sharedocument = await prisma.documentuser.findFirst({
            where: {
                docId: Number(documentId),
                userId: user.id
            }
        })
        if (sharedocument) {
            if (sharedocument.permission == permission) return res.status(200).json({message: "You have already shared this doc to this user"})
            
            await prisma.documentuser.update({
                where: {
                    id: sharedocument.id
                },
                data: {
                    permission: permission
                }
            })
            await SendMail({
                from: process.env.EMAIL,
                to: email,
                subject: `${document?.user.name} shared a document with you with ${permission} access`,
                text: `Hi ${user.name}, You can access the document here: ${process.env.LINK}/document/${documentId}`
            })
        }
        await prisma.documentuser.create({
            data: {
                docId: Number(documentId),
                userId: user.id,
                permission: permission
            }
        })
        await SendMail({
                from: process.env.EMAIL,
                to: email,
                subject: `${document?.user.name} shared a document with you with ${permission} access`,
                text: `Hi ${user.name}, You can access the document here: ${process.env.LINK}/document/${documentId}`
        })
        return res.status(200).json({message: "Document shared successfully"})

    } catch (error) {
        console.error(error)
        return res.status(400).json({error: "Error while sharing document"})
    }
}

export const getcollaborators = async (req: CustomRequest, res:Response) => {
    const {documentId} = req.params

    try {
        const collaborators = await prisma.documentuser.findMany({
            where: {
                docId: Number(documentId)
            },
            include: {
                user: true
            }
        })
        return res.status(200).json({collaborators})
    } catch (error) {
        console.error(error)
        return res.status(400).json({error: "Error while fetching collaborators"})
    }
}