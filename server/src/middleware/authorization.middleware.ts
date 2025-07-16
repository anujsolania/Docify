import { NextFunction, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"
import { CustomRequest } from "../interfaces/interfacess";


export const Authorization = (req:CustomRequest, res:Response, next:NextFunction) => {
    const accessToken = req.headers.authorization

    if (!accessToken) {
        return res.status(401).json({ error: "Access token missing" })
    }

    try {
        const decoded = jwt.verify(accessToken,process.env.JWT_KEY as string)
        req.userEmail = (decoded as JwtPayload).email
        req.userId = (decoded as JwtPayload).id
        console.log(`docAuthorization: ${req.userId}`)
        next()
    } catch (error) {
        return res.status(401).json({ error: (error as Error).message });
    } 
}