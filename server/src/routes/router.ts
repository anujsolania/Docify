import express from "express";
import userRouter from "./user.router";
import docRouter from "./document.router";
const router = express.Router()

router.use("/user", userRouter)
router.use("/document", docRouter)

export default router