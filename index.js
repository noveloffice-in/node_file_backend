import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import axios from 'axios';

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:5173",
            "https://erpnoveloffice.in",
            "https://noveloffice.in",
            "https://novelofficedfw.com",
        ],
        //-> Uncomment this if you want to allow everyone to access this
        // origin: "*",
        methods: ['GET', 'POST'],
    }
});

const apiURL = 'https://novelofficedfw.com';

// Basic route
app.get('/', (req, res) => {
    res.send('Chat application is running!');
});

app.get('/chat-app', (req, res) => {
    res.send('Chat application is running!');
});

// API to fetch previous messages for a room
app.get('/api/messages', async (req, res) => {
    const room = req.query.room;
    if (!room) {
        return res.status(400).json({ error: 'Room is required' });
    }

    try {
        const response = await axios.post(`${apiURL}/api/method/novelaichatassist`, {
            request: "fetch_messages",
            session_id: room,
        });
        res.json({ message: response.data.message || [] });
    } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Queue to store the messages before sending them to the API
const messageQueue = [];
let isProcessing = false;

// Function to process the message queue
async function processQueue() {
    if (isProcessing || messageQueue.length === 0) {
        return;
    }

    isProcessing = true;

    const message = messageQueue.shift();
    try {
        // Send the message to the API
        const response = await axios.post(`${apiURL}/api/method/novelaichatassist`, {
            request: "save_message",
            session_id: message.room,
            msg: message.msg,
            user: message.username
        });
        console.log('Message saved:', response.data);

        // Notify the room
        io.to(message.room).emit("receive_message", {
            msg: message.msg,
            room: message.room,
            username: message.username,
        });
    } catch (err) {
        console.error('Error saving message:', err);
    } finally {
        // Continue processing the queue after handling the current message
        isProcessing = false;
        processQueue();
    }
}

// Socket.io setup
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join_room", ({ room, username }) => {
        console.log(`${username} joined room: ${room}`);
        // Join the socket room
        socket.join(room);
    });

    socket.on("leave_room", ({ room, username }) => {
        socket.leave(room);
        console.log(`${username} Left room: ${room}`);
    });

    // Listen for client-sent events
    socket.on('msgprint', (message) => {
        console.log('Message from client:', message);
        // Emit an event back to the client for confirmation
        socket.emit('msgprint', `Server received: ${message}`);
    });

    // Handle client disconnect
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });

    // Handle sending messages
    socket.on("sendMessage", (data) => {
        console.log('Received message:', data);
        // Add the message to the queue for processing
        messageQueue.push(data);
        // Start processing the queue if not already processing
        processQueue();
    });
});

// const PORT = process.env.PORT || 4040;
const PORT = 4040;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
