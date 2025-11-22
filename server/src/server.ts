import { Server } from "socket.io"
import app from "./index"
import http from "http"
import jwt from "jsonwebtoken"

const server = http.createServer(app)

const io = new Server(server,{
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET","POST"]
    }
})

io.on("connection", (socket) => {
    const token = socket.handshake.query.token
    const documentId = socket.handshake.query.documentId || ""
      console.log("Client connected with token:", token);
      console.log("Document ID:", documentId);

    if (!token) {
    console.log("Missing token");
    return socket.disconnect();
    }
    
    try {
    let isVerified = jwt.verify(token as string, process.env.JWT_KEY as string);
    } catch (err) {
    console.log("Invalid token");
    return socket.disconnect();
    }

    socket.join(documentId)

    socket.on("send-changes", (delta) => {
        socket.to(documentId).emit("receive-changes",delta)
    })
})

server.listen(3000, () => {
    console.log(`server is running at 3000`)
})
