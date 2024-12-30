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
        origin: "*",
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

    socket.on("sendMessage", (data) => {
        let apiData = {};
        // Emit the message to the specific room with username
        axios.post(`${apiURL}/api/method/novelaichatassist`, {
            request: "save_message",
            session_id: data.room,
            msg: data.msg,
            user: data.username
        })
            .then((res) => {
                console.log(res.data);

                socket.to(data.room).emit("receive_message", {
                    msg: data.msg,
                    room: data.room,
                    username: data.username,
                });
            })
            .catch((err) => {
                console.log(err);
            })
    });
});

const PORT = process.env.PORT || 4040;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
