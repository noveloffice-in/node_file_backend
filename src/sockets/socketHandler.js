import { apiService } from '../services/apiService.js';

let messageQueue = [];
let isProcessing = false;
const assignedUsers = {};

const processQueue = async () => {
    if (isProcessing || messageQueue.length === 0) return;

    isProcessing = true;
    const message = messageQueue.shift();
    
    try {
        await apiService.saveMessage(message.room, message.msg, message.username);
    } catch (err) {
        console.error('Error saving message:', err);
    } finally {
        isProcessing = false;
        processQueue();
    }
};

const socketHandler = (io) => (socket) => {
    console.log('Client Connected:', socket.id);

    socket.on("join_room", ({ room, username }) => {
        socket.join(username === "Guest" ? room : "agent_room");
    });

    socket.on("leave_room", ({ room }) => {
        socket.leave(room);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });

    socket.on("sendMessage", (data) => {
        messageQueue.push(data);
        processQueue();

        const room = data.username === "Guest" ? "agent_room" : data.room;
        io.to(room).emit("receiveMessage", {
            msg: data.msg,
            room,
            username: data.username,
            sessionId: data.room
        });
    });

    socket.on("getAssignedUser", (data) => {
        if (!assignedUsers[data.sessionId]) {
            assignedUsers[data.sessionId] = data.user;
        }
        io.to(data.user).emit("assignedUserDetails", {
            sessionId: data.sessionId,
            assignedUser: assignedUsers[data.sessionId]
        });
    });
};

export default socketHandler;
