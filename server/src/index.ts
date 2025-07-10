import express from "express";
import cors from "cors"
import router from "./routes/router";
import dotenv from 'dotenv'

dotenv.config()

// console.log(process.env)

const app = express()
// const router = express.Router()

app.use(express.json())
app.use(cors())

app.use("/api/v1", router)

app.listen(3000, () => {
    console.log(`server is running at ${3000}`)
})