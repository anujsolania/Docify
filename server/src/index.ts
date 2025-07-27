import express from "express";
import cors from "cors"
import router from "./routes/router";
import dotenv from 'dotenv'

dotenv.config()

const app = express()

app.use(express.json())
app.use(cors())

app.use("/api/v1", router)

// app.listen(3000, () => {
//     console.log(`server is running at ${3000}`)
// })

export default app;