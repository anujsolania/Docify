import express from "express";
import { signinSchema, signupSchema, userValidator } from "../validate/user.validate";
import { signin, signup, verifyemail } from "../actions/user/user.actions";
const userRouter = express.Router()

userRouter.post("/signup",userValidator(signupSchema),signup)
userRouter.post("/signin",userValidator(signinSchema),signin)
userRouter.put("/verifyemail/:verificationToken",verifyemail)

export default userRouter

