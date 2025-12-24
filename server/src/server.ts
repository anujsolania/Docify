import { Server as SocketIOServer } from "socket.io"
import { WebSocketServer, WebSocket } from 'ws'
import * as Y from 'yjs'
import * as syncProtocol from 'y-protocols/sync'
import * as awarenessProtocol from 'y-protocols/awareness'
import * as encoding from 'lib0/encoding'
import * as decoding from 'lib0/decoding'
import http from "http"
import jwt from "jsonwebtoken"
import app from "./index"
import dotenv from "dotenv"

dotenv.config()

const server = http.createServer(app)

// Store Yjs documents, awareness, and connections
const docs = new Map<string, Y.Doc>()
const docAwareness = new Map<string, awarenessProtocol.Awareness>()
const docConnections = new Map<string, Set<WebSocket>>()

// Get or create a Yjs document
const getYDoc = (docName: string): Y.Doc => {
    let doc = docs.get(docName)
    if (!doc) {
        doc = new Y.Doc()
        docs.set(docName, doc)
    }
    return doc
}

// Get or create awareness for a document
const getAwareness = (docName: string): awarenessProtocol.Awareness => {
    let awareness = docAwareness.get(docName)
    if (!awareness) {
        const doc = getYDoc(docName)
        awareness = new awarenessProtocol.Awareness(doc)
        docAwareness.set(docName, awareness)
    }
    return awareness
}

// Get or create connections set for a document
const getDocConnections = (docName: string): Set<WebSocket> => {
    let connections = docConnections.get(docName)
    if (!connections) {
        connections = new Set()
        docConnections.set(docName, connections)
    }
    return connections
}

// Message type constants (matching y-websocket protocol)
const messageSync = 0
const messageAwareness = 1

// Setup WebSocket connection for Yjs syncing (y-websocket compatible)
const setupWSConnection = (ws: WebSocket, docName: string) => {
    const doc = getYDoc(docName)
    const awareness = getAwareness(docName)
    const connections = getDocConnections(docName)
    
    connections.add(ws)
    
    // Send sync step 1 to initialize client with current document state
    const encoderSync = encoding.createEncoder()
    encoding.writeVarUint(encoderSync, messageSync)
    syncProtocol.writeSyncStep1(encoderSync, doc)
    ws.send(encoding.toUint8Array(encoderSync))
    
    // Send current awareness state
    const awarenessStates = awareness.getStates()
    if (awarenessStates.size > 0) {
        const encoderAwareness = encoding.createEncoder()
        encoding.writeVarUint(encoderAwareness, messageAwareness)
        encoding.writeVarUint8Array(
            encoderAwareness,
            awarenessProtocol.encodeAwarenessUpdate(awareness, Array.from(awarenessStates.keys()))
        )
        ws.send(encoding.toUint8Array(encoderAwareness))
    }
    
    // Handle incoming messages
    ws.on('message', (message: Buffer) => {
        try {
            const uint8Array = new Uint8Array(message)
            const decoder = decoding.createDecoder(uint8Array)
            const messageType = decoding.readVarUint(decoder)
            
            if (messageType === messageSync) {
                encoding.writeVarUint(encoder, messageSync)
                const syncMessageType = syncProtocol.readSyncMessage(decoder, encoder, doc, ws)
                
                // Send encoder response if there's data to send
                if (encoding.length(encoder) > 1) {
                    ws.send(encoding.toUint8Array(encoder))
                }
            } else if (messageType === messageAwareness) {
                awarenessProtocol.applyAwarenessUpdate(
                    awareness,
                    decoding.readVarUint8Array(decoder),
                    ws
                )
            }
        } catch (err) {
            console.error('Error handling message:', err)
        }
    })
    
    // Create encoder for responses
    const encoder = encoding.createEncoder()
    
    // Broadcast document updates to all connected clients
    const updateHandler = (update: Uint8Array, origin: any) => {
        if (origin !== ws) {
            const encoder = encoding.createEncoder()
            encoding.writeVarUint(encoder, messageSync)
            syncProtocol.writeUpdate(encoder, update)
            const message = encoding.toUint8Array(encoder)
            
            connections.forEach((conn) => {
                if (conn.readyState === WebSocket.OPEN) {
                    conn.send(message)
                }
            })
        }
    }
    
    doc.on('update', updateHandler)
    
    // Broadcast awareness updates
    const awarenessChangeHandler = ({ added, updated, removed }: any, origin: any) => {
        const changedClients = added.concat(updated).concat(removed)
        const awarenessEncoder = encoding.createEncoder()
        encoding.writeVarUint(awarenessEncoder, messageAwareness)
        encoding.writeVarUint8Array(
            awarenessEncoder,
            awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients)
        )
        const message = encoding.toUint8Array(awarenessEncoder)
        
        connections.forEach((conn) => {
            if (conn !== origin && conn.readyState === WebSocket.OPEN) {
                conn.send(message)
            }
        })
    }
    
    awareness.on('update', awarenessChangeHandler)
    
    // Cleanup on disconnect
    ws.on('close', () => {
        doc.off('update', updateHandler)
        awareness.off('update', awarenessChangeHandler)
        connections.delete(ws)
        
        // Remove this client from awareness
        awarenessProtocol.removeAwarenessStates(awareness, [awareness.clientID], ws)
        
        // Cleanup if no more connections
        if (connections.size === 0) {
            docConnections.delete(docName)
            // Optionally cleanup doc and awareness after timeout
            setTimeout(() => {
                if (docConnections.get(docName)?.size === 0) {
                    docs.delete(docName)
                    docAwareness.delete(docName)
                }
            }, 60000) // 1 minute
        }
    })
    
    ws.on('error', (error) => {
        console.error('WebSocket error:', error)
    })
}

// Socket.IO for title changes (non-document-content features)
const io = new SocketIOServer(server, {
    cors: {
        origin: process.env.LINK,
        methods: ["GET","POST"]
    }
})

// Socket.IO: Handle title changes only
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
        console.log("Socket.IO auth failed:", err instanceof Error ? err.message : String(err))
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

// y-websocket server for collaborative document editing
const wss = new WebSocketServer({ noServer: true })

// Handle WebSocket upgrade with authentication
server.on('upgrade', (request, socket, head) => {
    const origin = request.headers.origin
    if (origin !== process.env.LINK) {
        socket.write('HTTP/1.1 403 Forbidden\r\n\r\n')
        socket.destroy()
        return
    }
    
    const url = new URL(request.url!, `http://${request.headers.host || 'localhost'}`)
    const token = url.searchParams.get('token')
    const documentId = url.searchParams.get('documentId')
    
    if (!token || !documentId) {
        console.log("Missing token or documentId in WebSocket connection")
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
        socket.destroy()
        return
    }
    
    try {
        jwt.verify(token, process.env.JWT_KEY as string)
    } catch (err: any) {
        console.log(`WebSocket auth failed: ${err.message}`)
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
        socket.destroy()
        return
    }
    
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request)
    })
})

// Yjs WebSocket: Handle document syncing
wss.on('connection', (ws, req) => {
    const url = new URL(req.url!, `http://${req.headers.host || 'localhost'}`)
    const documentId = url.searchParams.get('documentId')
    
    console.log(`Yjs WebSocket connected for document: ${documentId}`)
    
    setupWSConnection(ws, `document-${documentId}`)
})

server.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`)
})

export default server
