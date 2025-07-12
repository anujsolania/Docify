import express from "express";
import { emailSchema, signinSchema, signupSchema, userValidator } from "../validate/user.validate";
import { forgotpassword, signin, signup, verifyemail } from "../actions/user/user.actions";
import { forgotPasswordAuthentication as forgotPassAuth, SigninAuthetication as SigninAuth, SignupAuthetication as SignupAuth } from "../middleware/authentication.middleware";
const userRouter = express.Router()

userRouter.post("/signup",userValidator(signupSchema),SignupAuth, signup)
userRouter.post("/signin",userValidator(signinSchema),SigninAuth, signin)
userRouter.put("/verifyemail/:verificationToken",verifyemail)
userRouter.post("/forgotpassword",userValidator(emailSchema),forgotPassAuth,forgotpassword)

export default userRouter

