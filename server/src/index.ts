import express from "express";
import cors from "cors"
import router from "./routes/router";
import dotenv from 'dotenv'

dotenv.config()

const app = express()

// app.use(express.json())

// // app.use(cors())
// app.use(cors({
//     origin: `${process.env.LINK}`,
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
// }))

// app.use("/api/v1", router)

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://docify-frontend.vercel.app"
  ],
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true
}));

app.options("*", cors()); // preflight

app.use(express.json());

// Routes here
app.use("/api/v1", router)

// app.listen(3000, () => {
//     console.log(`server is running at ${3000}`)
// })

export default app;