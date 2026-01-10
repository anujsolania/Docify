import { Server as SocketIOServer } from "socket.io"
import { WebSocketServer } from 'ws'
import http from "http"
import jwt from "jsonwebtoken"
import app from "./index"
import dotenv from "dotenv"

// Import y-websocket utils (CommonJS compatibility)
const { setupWSConnection } = require('y-websocket/bin/utils')

dotenv.config()

const server = http.createServer(app)

// Socket.IO for title changes only
const io = new SocketIOServer(server, {
    cors: {
        origin: process.env.LINK,
        methods: ["GET","POST"]
    }
})

// Yjs WebSocket server for document syncing
const wss = new WebSocketServer({ noServer: true })  // Changed to noServer

// Socket.IO: Handle title changes (not document content)
io.on("connection", (socket) => {
    const token = socket.handshake.auth.token
    const documentId = socket.handshake.auth.documentId
    
    if (!token || !documentId) {
        console.log("Missing token or documentId")
        return socket.disconnect()
    }
    
    try {
        jwt.verify(token, process.env.JWT_KEY as string)
    } catch (err) {
        console.log("Socket.IO auth failed:", err.message)
        return socket.disconnect()
    }
    
    socket.join(documentId)
    
    socket.on("title-change", (newTitle) => {
        socket.to(documentId).emit("receive-title-change", newTitle)
    })
    
    socket.on("title-edit-start", (user) => {
        socket.to(documentId).emit("title-edit-start", user)
    })
    
    socket.on("title-edit-end", () => {
        socket.to(documentId).emit("title-edit-end")
    })
})

// Handle WebSocket upgrade manually to verify CORS and auth
server.on('upgrade', (request, socket, head) => {
    // Verify origin
    const origin = request.headers.origin
    if (origin !== process.env.LINK) {
        socket.write('HTTP/1.1 403 Forbidden\r\n\r\n')
        socket.destroy()
        return
    }
    
    // Parse URL for token and documentId
    const url = new URL(request.url!, `http://${request.headers.host || 'localhost'}`)
    const token = url.searchParams.get('token')
    const documentId = url.searchParams.get('documentId')
    
    if (!token || !documentId) {
        console.log("Missing token or documentId in WebSocket connection")
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
        socket.destroy()
        return
    }
    
    // Verify JWT
    try {
        jwt.verify(token, process.env.JWT_KEY as string)
    } catch (err: any) {
        console.log(`WebSocket auth failed: ${err.message}`)
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
        socket.destroy()
        return
    }
    
    // Upgrade to WebSocket
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request)
    })
})

// Yjs WebSocket: Handle document syncing
wss.on('connection', (ws, req) => {
    const url = new URL(req.url!, `http://${req.headers.host || 'localhost'}`)
    const documentId = url.searchParams.get('documentId')
    
    console.log(`Yjs WebSocket connected for document: ${documentId}`)
    
    // setupWSConnection handles all the Yjs syncing magic
    setupWSConnection(ws, req, { 
        docName: `document-${documentId}` 
    })
})

server.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`)
})