// import { Server } from "socket.io"
// import app from "./index"
// import http from "http"
// import jwt, { JwtPayload } from "jsonwebtoken"
// import dotenv from "dotenv"

// dotenv.config()

// const server = http.createServer(app)

// const io = new Server(server,{
//     cors: {
//         origin: `${process.env.LINK}`,
//         methods: ["GET","POST"]
//     }
// })

// // Track active users per document
// // Map structure: documentId -> Array of {userId, userEmail}
// const documentUsers = new Map<string, Array<{userId: number, userEmail: string}>>();

// io.on("connection", (socket) => {
//     const token = socket.handshake.auth.token
//     const documentId = socket.handshake.auth.documentId as string
//     console.log("Client connected with token:", token);
//     console.log("Document ID:", documentId);

//     if (!token) {
//         console.log("Missing token");
//         return socket.disconnect();
//     }

//     let user: JwtPayload
//     try {
//         //each user's socket is verified using JWT
//         const decoded = jwt.verify(token as string, process.env.JWT_KEY as string);
        
//         // Type guard to ensure decoded is not a string
//         if (typeof decoded === 'string') {
//             console.log("Token should be an object, but got a string");
//             return socket.disconnect();
//         }
        
//         user = decoded;
//     } catch (err) {
//         console.log("Invalid token");
//         return socket.disconnect();
//     }

//     const userId = user.id 
//     const userEmail = user.email

//     socket.join(documentId)

// socket.on("title-change", (newTitle) => {
//     // Broadcast to all other users in the same document room
//     socket.to(documentId).emit("receive-title-change", newTitle)
// })

// socket.on("title-edit-start", (user) => {
//     // Broadcast to all other users that someone started editing
//     socket.to(documentId).emit("title-edit-start", user)
// })

// socket.on("title-edit-end", () => {
//     // Broadcast to all other users that editing ended
//     socket.to(documentId).emit("title-edit-end")
// })

//     // socket.on("send-changes", (delta) => {
//     //     socket.to(documentId).emit("receive-changes",delta)
//     // })

//     //receive and broadcast cursor position to everyone except the sender
//     // socket.on("cursor-change", (data) => {
//     //     socket.to(documentId).emit("cursor-update",data)
//     // })

//     //receive and broadcast user that joined to everyone
//     // socket.on("join-document", (data) => {
//     //     // Initialize document if it doesn't exist
//     //     if (!documentUsers.has(documentId)) {
//     //         documentUsers.set(documentId, []);
//     //     }
        
//     //     const usersInDoc = documentUsers.get(documentId)!;
        
//     //     // Add new user if not already in list (prevent duplicates)
//     //     const userExists = usersInDoc.find(u => u.userId === data.userId);
//     //     if (!userExists) {
//     //         usersInDoc.push({
//     //             userId: data.userId, 
//     //             userEmail: data.userEmail
//     //         });
//     //     }
        
//     //     // Broadcast complete active users list to everyone in the document
//     //     io.to(documentId).emit("active-users-update", usersInDoc);
        
//     //     console.log(`User ${data.userEmail} joined document ${documentId}. Active users:`, usersInDoc);
//     // })

//     socket.on("disconnect", () => {
//         console.log("Client disconnected");
        
//         // Remove user from document tracking
//         if (documentUsers.has(documentId)) {
//             const usersInDoc = documentUsers.get(documentId)!;
//             const filteredUsers = usersInDoc.filter(u => u.userId !== userId);
//             documentUsers.set(documentId, filteredUsers);
            
//             // If no users left, clean up the map entry
//             if (filteredUsers.length === 0) {
//                 documentUsers.delete(documentId);
//             }
            
//             // Broadcast updated list to remaining users
//             io.to(documentId).emit("active-users-update", filteredUsers);
            
//             console.log(`User ${userEmail} left document ${documentId}. Remaining users:`, filteredUsers);
//         }
//     })
// })

// server.listen(process.env.PORT || 3000, () => {
//     console.log(`server is running at 3000`)
// })


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