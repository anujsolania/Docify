import { error } from "console";
import { NextFunction, Request, Response } from "express";
import { z, ZodSchema, ZodTypeAny } from "zod";

export const signupSchema = z.object({
    name: z.string().trim().min(3,{message: "Firstname must be atleast 3 characters long"}),
    email: z.string().trim().email({message: "invalid email"}),
    password: z.string().trim().min(6,{message: "Password must be at least 6 characters long"} )
})

export const signinSchema = z.object({
    email: z.string().trim().email({message: "invalid email"}),
    password: z.string().trim().min(6,{message: "Password must be at least 6 characters long"} )
})

export const emailSchema = z.object({
    email: z.string().email({message: "Invalid email"})
})


export const userValidator = (schema: ZodTypeAny) => {
    return (req: Request, res:Response, next:NextFunction) => {
        const result = schema.safeParse(req.body) 
        if(!result.success) {
            return res.status(400).json({error: result.error.errors[0].message})
        }
        next()
    }
}

