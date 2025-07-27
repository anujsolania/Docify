import { Server } from "socket.io"
import app from "./index"
import http from "http"

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

    socket.join(documentId)

    socket.on("send-changes", (delta) => {
        socket.to(documentId).emit("receive-changes",delta)
    })
})

server.listen(3000, () => {
    console.log(`server is running at 3000`)
})
