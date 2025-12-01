import { Request } from "express";

export interface CustomRequest extends Request {
  userId?: number;
  userEmail?: string
  userName?: string
}

export interface TokenPayload {
    id: string;
    email: string;
  }