"use strict";
// OPTION 1: Using y-websocket's built-in setupWSConnection utility
// This is the official, production-ready approach
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const utils_1 = require("y-websocket/bin/utils");
const http_1 = __importDefault(require("http"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = __importDefault(require("./index"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const server = http_1.default.createServer(index_1.default);
// y-websocket server - handles all Yjs syncing automatically
const wss = new ws_1.WebSocketServer({ noServer: true });
// Handle WebSocket upgrade with authentication
server.on('upgrade', (request, socket, head) => {
    // Verify origin (CORS)
    const origin = request.headers.origin;
    if (origin !== process.env.LINK) {
        socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
        socket.destroy();
        return;
    }
    // Parse URL for token and documentId
    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
    const token = url.searchParams.get('token');
    const documentId = url.searchParams.get('documentId');
    if (!token || !documentId) {
        console.log("Missing token or documentId");
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
    }
    // Verify JWT
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_KEY);
        // Optional: Check document permissions here
        // const hasPermission = await checkUserPermission(decoded, documentId)
        // if (!hasPermission) { socket.destroy(); return }
    }
    catch (err) {
        console.log(`Auth failed: ${err.message}`);
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
    }
    // Upgrade to WebSocket
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});
// y-websocket connection handler
wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const documentId = url.searchParams.get('documentId');
    console.log(`Yjs connected: document-${documentId}`);
    // setupWSConnection handles ALL Yjs syncing automatically:
    // - Sync protocol (step 1, 2, updates)
    // - Awareness protocol (cursors, presence)
    // - Document persistence
    // - Broadcasting to all clients
    // - Error handling
    (0, utils_1.setupWSConnection)(ws, req, { docName: `document-${documentId}` });
});
server.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);
});
exports.default = server;
