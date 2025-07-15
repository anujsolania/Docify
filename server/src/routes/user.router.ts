import express from "express";
import { emailSchema,resetpasswordSchema, signinSchema, signupSchema, userValidator } from "../validate/user.validate";
import { forgotpassword, forgotpassworddd, getuser, resetpassword, signin, signup, verifyemail } from "../actions/user.actions";
import { forgotPasswordAuthentication as forgotPassAuth, SigninAuthetication as SigninAuth, SignupAuthetication as SignupAuth } from "../middleware/authentication.middleware";
import { Authorization } from "../middleware/authorization.middleware";
const userRouter = express.Router()

userRouter.post("/signup",userValidator(signupSchema),SignupAuth, signup)
userRouter.post("/signin",userValidator(signinSchema),SigninAuth, signin)
userRouter.put("/verifyemail/:verificationToken",verifyemail)
userRouter.post("/forgotpassword",userValidator(emailSchema),forgotPassAuth,forgotpassword)
userRouter.post("/forgotpassword/:resetpasswordToken",forgotpassworddd)
userRouter.post("/resetpassword",userValidator(resetpasswordSchema),resetpassword)
userRouter.get("/",Authorization,getuser)

export default userRouter

