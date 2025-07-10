import express from "express";
import { signinSchema, signupSchema, userValidator } from "../validate/user.validate";
const userRouter = express.Router()

userRouter.get("/signup",userValidator(signupSchema), )
userRouter.get("/signin",userValidator(signinSchema), )

export default userRouter

