import { Server } from "socket.io"
import app from "./index"
import http from "http"
import jwt, { JwtPayload } from "jsonwebtoken"
import { TokenPayload } from "./interfaces/interfacess"

const server = http.createServer(app)

const io = new Server(server,{
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET","POST"]
    }
})

// Track active users per document
// Map structure: documentId -> Array of {userId, userEmail}
const documentUsers = new Map<string, Array<{userId: number, userEmail: string}>>();

io.on("connection", (socket) => {
    const token = socket.handshake.query.token
    const documentId = socket.handshake.query.documentId as string
    console.log("Client connected with token:", token);
    console.log("Document ID:", documentId);

    if (!token) {
        console.log("Missing token");
        return socket.disconnect();
    }

    let user: JwtPayload
    try {
        //each user's socket is verified using JWT
        const decoded = jwt.verify(token as string, process.env.JWT_KEY as string);
        
        // Type guard to ensure decoded is not a string
        if (typeof decoded === 'string') {
            console.log("Token should be an object, but got a string");
            return socket.disconnect();
        }
        
        user = decoded;
    } catch (err) {
        console.log("Invalid token");
        return socket.disconnect();
    }

    const userId = user.id 
    const userEmail = user.email

    socket.join(documentId)

    socket.on("send-changes", (delta) => {
        socket.to(documentId).emit("receive-changes",delta)
    })

    //receive and broadcast cursor position to everyone except the sender
    socket.on("cursor-change", (data) => {
        socket.to(documentId).emit("cursor-update",data)
    })

    //receive and broadcast user that joined to everyone
    socket.on("join-document", (data) => {
        // Initialize document if it doesn't exist
        if (!documentUsers.has(documentId)) {
            documentUsers.set(documentId, []);
        }
        
        const usersInDoc = documentUsers.get(documentId)!;
        
        // Add new user if not already in list (prevent duplicates)
        const userExists = usersInDoc.find(u => u.userId === data.userId);
        if (!userExists) {
            usersInDoc.push({
                userId: data.userId, 
                userEmail: data.userEmail
            });
        }
        
        // Broadcast complete active users list to everyone in the document
        io.to(documentId).emit("active-users-update", usersInDoc);
        
        console.log(`User ${data.userEmail} joined document ${documentId}. Active users:`, usersInDoc);
    })

    socket.on("disconnect", () => {
        console.log("Client disconnected");
        
        // Remove user from document tracking
        if (documentUsers.has(documentId)) {
            const usersInDoc = documentUsers.get(documentId)!;
            const filteredUsers = usersInDoc.filter(u => u.userId !== userId);
            documentUsers.set(documentId, filteredUsers);
            
            // If no users left, clean up the map entry
            if (filteredUsers.length === 0) {
                documentUsers.delete(documentId);
            }
            
            // Broadcast updated list to remaining users
            io.to(documentId).emit("active-users-update", filteredUsers);
            
            console.log(`User ${userEmail} left document ${documentId}. Remaining users:`, filteredUsers);
        }
    })
})

server.listen(3000, () => {
    console.log(`server is running at 3000`)
})
