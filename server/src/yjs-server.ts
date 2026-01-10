import { Server as SocketIOServer } from "socket.io"
import { WebSocketServer, WebSocket } from 'ws'
import http from "http"
import jwt, { JwtPayload } from 'jsonwebtoken'
import app from './index'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'
import * as Y from 'yjs'
import * as syncProtocol from 'y-protocols/sync'
import * as awarenessProtocol from 'y-protocols/awareness'
import * as encoding from 'lib0/encoding'
import * as decoding from 'lib0/decoding'
import { Awareness } from 'y-protocols/awareness'

dotenv.config()

const prisma = new PrismaClient()
const server = http.createServer(app)

// Socket.IO for title changes and notifications
const io = new SocketIOServer(server, {
    cors: {
        origin: process.env.LINK,
        methods: ["GET","POST"]
    }
})

// Y-WebSocket server for document syncing - MUST be after Socket.IO
const wss = new WebSocketServer({ noServer: true })

// Store for Yjs documents - in-memory
const docs = new Map<string, WSSharedDoc>()

interface WSSharedDoc {
    name: string
    doc: Y.Doc
    awareness: Awareness
    conns: Map<WebSocket, Set<number>>
}

const messageSync = 0
const messageAwareness = 1

// Load Yjs document from database
const loadDocFromDB = async (docname: string, ydoc: Y.Doc): Promise<void> => {
    try {
        // Extract documentId from docname (format: "document-123")
        const documentId = parseInt(docname.replace('document-', ''))
        
        const document = await prisma.document.findUnique({
            where: { id: documentId }
        })
        
        if (document?.content) {
            // Document exists in DB, load it into Yjs
            console.log(`Loading document ${documentId} from database`)
            // The content will be synced when clients connect
            // We don't need to pre-populate here as clients will load from DB
        }
    } catch (err) {
        console.error(`Error loading document from DB:`, err)
    }
}

const getYDoc = (docname: string): WSSharedDoc => {
    let doc = docs.get(docname)
    if (!doc) {
        const ydoc = new Y.Doc()
        const awareness = new Awareness(ydoc)
        doc = {
            name: docname,
            doc: ydoc,
            awareness,
            conns: new Map()
        }
        docs.set(docname, doc)

        // SET UP SYNC AND AWARENESS BROADCASTING - ADD THIS LINE:
        setupDocumentSync(doc)
        
        // Load initial content from database
        loadDocFromDB(docname, ydoc)
    }
    return doc
}

const closeConn = (doc: WSSharedDoc, conn: WebSocket) => {
    if (doc.conns.has(conn)) {
        const controlledIds = doc.conns.get(conn)
        doc.conns.delete(conn)
        
        // Remove awareness states for this connection
        if (controlledIds && controlledIds.size > 0) {
            awarenessProtocol.removeAwarenessStates(doc.awareness, Array.from(controlledIds), null)
        }
    }
    if (conn.readyState === WebSocket.OPEN || conn.readyState === WebSocket.CONNECTING) {
        conn.close()
    }
}

const send = (doc: WSSharedDoc, conn: WebSocket, message: Uint8Array) => {
    if (conn.readyState !== WebSocket.CONNECTING && conn.readyState !== WebSocket.OPEN) {
        closeConn(doc, conn)
    }
    try {
        conn.send(message, (err) => {
            if (err != null) {
                closeConn(doc, conn)
            }
        })
    } catch (e) {
        closeConn(doc, conn)
    }
}

const setupWSConnection = (conn: WebSocket, docName: string) => {
    conn.binaryType = 'arraybuffer'
    const doc = getYDoc(docName)
    doc.conns.set(conn, new Set())

    conn.on('message', (message: ArrayBuffer) => {
        try {
            const encoder = encoding.createEncoder()
            const decoder = decoding.createDecoder(new Uint8Array(message))
            const messageType = decoding.readVarUint(decoder)
        
            switch (messageType) {
                case messageSync:
                    encoding.writeVarUint(encoder, messageSync)
                    syncProtocol.readSyncMessage(decoder, encoder, doc.doc, conn)
                    if (encoding.length(encoder) > 1) {
                        send(doc, conn, encoding.toUint8Array(encoder))
                    }
                    break
                case messageAwareness:
                    const awarenessUpdate = decoding.readVarUint8Array(decoder)
                    awarenessProtocol.applyAwarenessUpdate(doc.awareness, awarenessUpdate, conn)
                    
                    // Track awareness client ID from this connection (for cleanup)
                    const controlledIds = doc.conns.get(conn)
                    if (controlledIds && doc.awareness.clientID) {
                        controlledIds.add(doc.awareness.clientID)
                    }
                    break
            }
        } catch (err) {
            console.error('Error handling message:', err)
        }
    })

    conn.on('close', () => {
        console.log(`WebSocket closed for ${docName}`)
        closeConn(doc, conn)
        
        // Clean up document if no connections remain
        if (doc.conns.size === 0) {
            console.log(`No connections left for ${docName}, cleaning up in 30s...`)
            setTimeout(() => {
                if (doc.conns.size === 0) {
                    docs.delete(docName)
                    doc.doc.destroy()
                    console.log(`Document ${docName} cleaned up`)
                }
            }, 30000) // 30 second grace period
        }
    })

    conn.on('error', (err) => {
        console.error('WebSocket error:', err)
        closeConn(doc, conn)
    })

    // Send sync step 1
    const encoder = encoding.createEncoder()
    encoding.writeVarUint(encoder, messageSync)
    syncProtocol.writeSyncStep1(encoder, doc.doc)
    send(doc, conn, encoding.toUint8Array(encoder))

    const awarenessStates = doc.awareness.getStates()
    if (awarenessStates.size > 0) {
        const encoder = encoding.createEncoder()
        encoding.writeVarUint(encoder, messageAwareness)
        encoding.writeVarUint8Array(encoder, awarenessProtocol.encodeAwarenessUpdate(doc.awareness, Array.from(awarenessStates.keys())))
        send(doc, conn, encoding.toUint8Array(encoder))
    }
}

// Broadcast awareness and document updates
const setupDocumentSync = (doc: WSSharedDoc) => {
    const awarenessChangeHandler = ({ added, updated, removed }: any, conn: WebSocket | null) => {
        const changedClients = added.concat(updated, removed)
        if (changedClients.length > 0) {
            const encoder = encoding.createEncoder()
            encoding.writeVarUint(encoder, messageAwareness)
            encoding.writeVarUint8Array(encoder, awarenessProtocol.encodeAwarenessUpdate(doc.awareness, changedClients))
            const buff = encoding.toUint8Array(encoder)
            doc.conns.forEach((_, c) => {
                send(doc, c, buff)
            })
        }
    }
    doc.awareness.on('update', awarenessChangeHandler)

    doc.doc.on('update', (update: Uint8Array, origin: any) => {
        const encoder = encoding.createEncoder()
        encoding.writeVarUint(encoder, messageSync)
        syncProtocol.writeUpdate(encoder, update)
        const message = encoding.toUint8Array(encoder)
        doc.conns.forEach((_, conn) => {
            send(doc, conn, message)
        })
    })
}

// Socket.IO: Handle title changes (not document content)
io.on("connection", (socket) => {
    const token = socket.handshake.auth.token
    const documentId = socket.handshake.auth.documentId
    
    if (!token || !documentId) {
        console.log("Socket.IO: Missing token or documentId")
        return socket.disconnect()
    }
    
    try {
        jwt.verify(token, process.env.JWT_KEY as string)
    } catch (err) {
        console.log("Socket.IO auth failed:", err instanceof Error ? err.message : 'Unknown error')
        return socket.disconnect()
    }
    
    socket.join(documentId)
    console.log(`Socket.IO: Client joined room ${documentId}`)
    
    // Broadcast title changes to other users in the same document
    socket.on("title-change", (newTitle: string) => {
        socket.to(documentId).emit("receive-title-change", newTitle)
    })
    
    // Notify others when someone starts editing the title
    socket.on("title-edit-start", (user: { userId: number; userEmail: string }) => {
        socket.to(documentId).emit("title-edit-start", user)
    })
    
    // Notify others when title editing ends
    socket.on("title-edit-end", () => {
        socket.to(documentId).emit("title-edit-end")
    })
    
    socket.on("disconnect", () => {
        console.log(`Socket.IO: Client disconnected from room ${documentId}`)
    })
})

// Handle WebSocket upgrade for Yjs with authentication and permission checking
server.on('upgrade', async (request, socket, head) => {
    console.log(`[UPGRADE] Request URL: ${request.url}`)
    console.log(`[UPGRADE] Origin: ${request.headers.origin}`)
    
    // Socket.IO handles its own upgrades on /socket.io/ path
    // Only handle raw WebSocket connections for Yjs
    if (request.url?.includes('/socket.io/')) {
        console.log('[UPGRADE] Socket.IO path detected, letting Socket.IO handle it')
        return // Let Socket.IO handle this
    }

    // Verify origin (CORS)
    const origin = request.headers.origin
    if (origin !== process.env.LINK) {
        console.log(`[UPGRADE] CORS failed. Expected: ${process.env.LINK}, Got: ${origin}`)
        socket.write('HTTP/1.1 403 Forbidden\r\n\r\n')
        socket.destroy()
        return
    }

    // Parse URL for token and documentId
    const url = new URL(request.url!, `http://${request.headers.host || 'localhost'}`)
    const token = url.searchParams.get('token')
    const documentId = url.searchParams.get('documentId')

    console.log(`[UPGRADE] Token present: ${!!token}, DocumentId: ${documentId}`)

    if (!token || !documentId) {
        console.log("WebSocket: Missing token or documentId")
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
        socket.destroy()
        return
    }

    // Verify JWT
    let decoded: JwtPayload
    try {
        const result = jwt.verify(token, process.env.JWT_KEY as string)
        
        if (typeof result === 'string') {
            console.log("WebSocket: Invalid token format")
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
            socket.destroy()
            return
        }
        
        decoded = result
    } catch (err) {
        console.log(`WebSocket auth failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
        socket.destroy()
        return
    }

    // Check document permissions - both owner and shared users
    try {
        const docId = parseInt(documentId)
        const userId = decoded.id as number

        // First check if user is the document owner
        const document = await prisma.document.findFirst({
            where: {
                id: docId,
                userId: userId
            }
        })

        if (document) {
            console.log(`User ${userId} authorized as OWNER of document ${documentId}`)
        } else {
            // If not owner, check if they're in the shared users list
            const userDocument = await prisma.documentuser.findFirst({
                where: {
                    userId: userId,
                    docId: docId
                }
            })

            if (!userDocument) {
                console.log(`User ${userId} has no access to document ${documentId}`)
                socket.write('HTTP/1.1 403 Forbidden\r\n\r\n')
                socket.destroy()
                return
            }

            console.log(`User ${userId} authorized for document ${documentId} with ${userDocument.permission} permission`)
        }
    } catch (err) {
        console.log(`Database error: ${err instanceof Error ? err.message : 'Unknown error'}`)
        socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n')
        socket.destroy()
        return
    }

    // Upgrade to WebSocket for Yjs
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request)
    })
})

// Y-WebSocket: Handle document syncing
wss.on('connection', (ws, req) => {
    const url = new URL(req.url!, `http://${req.headers.host || 'localhost'}`)
    const documentId = url.searchParams.get('documentId')
    const docName = `document-${documentId}`
    
    console.log(`Yjs WebSocket connected: ${docName}`)

    setupWSConnection(ws, docName)
})

server.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`)
    console.log(`Socket.IO ready for title sync`)
    console.log(`Y-WebSocket ready for document sync`)
})

export default server
