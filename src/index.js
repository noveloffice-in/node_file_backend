import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import './config/envConfig';

import { sessionController, locationController, messageController } from './controllers';
import socketHandler from './sockets/socketHandler';
import corsMiddleware from './middlewares/corsMiddleware';

const app = express();
app.use(corsMiddleware);
app.use(express.json());

// API Routes
app.get('/', (req, res) => {
    res.send('Chat application is running!');
});

app.post('/api/v1/session', sessionController);
app.post('/api/v1/location', locationController);
app.post('/api/v1/messages', messageController);

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.ALLOWED_ORIGINS,
        methods: ['GET', 'POST'],
    },
});

// Socket.io
io.on('connection', socketHandler(io));

const PORT = process.env.PORT || 4040;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
