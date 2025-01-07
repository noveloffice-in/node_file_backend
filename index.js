import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const allowedOrigins = process.env.ALLOWED_ORIGINS;
const apiURL = process.env.API_URL;

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
    }
});

// Basic route
app.get('/', (req, res) => {
    res.send('Chat application is running!');
});

app.post('/api/v1/session', async (req, res) => {

    const os = req.body.os;
    const ip = req.body.ip;
    try {
        const response = await axios.post(`${apiURL}/api/method/novelaichatassist`, {
            request: "create_doc",
            "os": os,
            "ip": ip
        });
        res.json(response.data.message);
    } catch (err) {
        console.error('Error fetching session:', err);
        res.status(500).json({ error: 'Failed to fetch session' });
    }
});

app.post('/api/v1/location', async (req, res) => {
    try {
        const response = await axios.post(`${apiURL}/api/method/novelaichatassist`, {
            request: "add_location_details",
            "session_id": req.body.sessionID,
            "accuracy": req.body.accuracy,
            "longitude": req.body.longitude,
            "latitude": req.body.latitude
        });
        res.json(response.data.message);
    } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// API to fetch previous messages for a room
app.post('/api/v1/messages', async (req, res) => {
    try {
        const response = await axios.post(`${apiURL}/api/method/novelaichatassist`, {
            request: "fetch_messages",
            session_id: req.body.session_id,
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

    console.log('Client Connected:', socket.id);

    socket.on("join_room", ({ room, username }) => {
        username === "Guest" ? socket.join(room) : socket.join("agent_room");
    });

    socket.on("leave_room", ({ room, username }) => {
        socket.leave(room);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });

    socket.on("sendMessage", (data) => {
        // Add the message to the queue for processing
        messageQueue.push(data);
        // Start processing the queue if not already processing
        processQueue();
        // Notify the room
        data.room = data.username === "Guest" ? "agent_room" : data.room;
        io.to(data.room).emit("receiveMessage", {
            msg: data.msg,
            room: data.room,
            username: data.username,
        });
    });
});

// const PORT = process.env.PORT || 4040;
const PORT = 4040;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
