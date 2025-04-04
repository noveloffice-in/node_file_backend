import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import './src/config/envConfig.js';
import socketHandler from './src/sockets/socketHandler.js'
import corsMiddleware from './src/middlewares/corsMiddleware.js';
import { sessionController } from './src/controllers/sessionController.js';
import { locationController } from './src/controllers/locationController.js';
import { messageController } from './src/controllers/messageController.js';
import { contactDetailsController } from './src/controllers/contactDetailsController.js';
import { deployController } from './src/controllers/deployController.js';
import { utilsController } from './src/controllers/utilsController.js';
import { feedbackController } from './src/controllers/feedbackController.js';

const app = express();
app.use(corsMiddleware);
app.use(express.json());

// .env config
// API_URL=''
// ALLOWED_ORIGINS="*"
// API_KEY=""
// API_SECRET=""
// REPO_WEBHOOK_SECRET=""
// USER=""

// API Routes
app.get('/', (req, res) => {
    res.send('Chat application is running!');
});

app.post('/api/v1/utils', utilsController);
app.post('/api/v1/session', sessionController);
app.post('/api/v1/location', locationController);
app.post('/api/v1/messages', messageController);
app.post('/api/v1/updateContactDetails', contactDetailsController);
app.post('/api/v1/updatefeedback', feedbackController);
app.post('/cicd/deploy', deployController);

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
