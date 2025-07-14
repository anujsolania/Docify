import { NextFunction, Request, Response } from "express";
import z, { ZodAny, ZodSchema, ZodTypeAny } from "zod";

export const documentSchema = z.object({
    title: z.string().trim(),
    content: z.string().trim()
}) 

export function docValidator(schema: ZodTypeAny) {
    return (req:Request, res:Response, next:NextFunction) => {
        const result = schema.safeParse(req.body)
        if (!result.success) {
            return res.status(400).json({error: result.error.errors[0].message})
        }
        next()
    }
}