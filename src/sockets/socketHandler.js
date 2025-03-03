import { apiService } from '../services/apiService.js';

let messageQueue = [];
let isProcessing = false;
const assignedUsers = {};

const getCurrentDateTime = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Ensure two digits
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const processQueue = async () => {
    if (isProcessing || messageQueue.length === 0) return;

    isProcessing = true;
    const message = messageQueue.shift();

    try {
        await apiService.saveMessage(
            message.room,
            message.msg,
            message.username,
            message.messageType,
            message.agentEmail,
            getCurrentDateTime()
        );
    } catch (err) {
        console.error('Error saving message:', err);
    } finally {
        isProcessing = false;
        processQueue();
    }
};

const socketHandler = (io) => (socket) => {
    console.log('Client Connected:', socket.id);

    // General
    socket.on("join_room", ({ room, username }) => {
        socket.join(username === "Guest" ? room : "agent_room");
    });

    socket.on("leave_room", ({ room }) => {
        socket.leave(room);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });

    // Client Side
    socket.on("sendMessage", (data) => {
        messageQueue.push(data);
        processQueue();

        const room = data.username === "Guest" ? "agent_room" : data.room;
        io.to(room).emit("receiveMessage", {
            msg: data.msg,
            room,
            username: data.username,
            sessionId: data.room,
            messageType: data.messageType ? data.messageType : "Message",
            timeStamp: getCurrentDateTime()
        });
    });

    socket.on('guestTyping', (data) => {
        io.to("agent_room").emit('guestTyping', {
            room: data.room,
            username: data.username,
            msg: data.msg,
        });
    });


    // Agent Side
    socket.on('getAssignedUser', (data) => {
        if (!assignedUsers[data.sessionId]) {
            assignedUsers[data.sessionId] = data.agentEmail;
            messageQueue.push({
                room: data.sessionId,
                username: data.user,
                messageType: "Activity",
                msg: `${data.user} has joined the chat.`,
                agentEmail: data.agentEmail
            });
            processQueue();

            io.to("agent_room").emit('agentJoined', {
                room: data.sessionId,
                msg: data.message,
                username: data.user,
                messageType: "Activity",
                agentEmail: data.agentEmail
            });
            io.to(data.sessionId).emit('agentJoined', {
                username: data.user,
            });
        }
        io.to(data.agentEmail).emit("assignedUserDetails", {
            sessionId: data.sessionId,
            assignedUser: assignedUsers[data.sessionId],
            message: data.message,
        });
    });

    socket.on("assignToMe", (data) => {
        assignedUsers[data.sessionId] = data.agentEmail;
        messageQueue.push({
            room: data.sessionId,
            username: data.user,
            messageType: "Activity",
            msg: `${data.user} has joined the chat.`,
            agentEmail: data.agentEmail
        });
        processQueue();
        io.to("agent_room").emit('agentJoined', {
            room: data.sessionId,
            msg: data.message,
            username: data.user,
            messageType: "Activity",
            agentEmail: data.agentEmail
        });
        io.to(data.sessionId).emit('agentJoined', {
            username: data.user,
        });
    });

    socket.on('agentTyping', (data) => {
        io.to(data.room).emit('agentTyping', {
            "typing": true
        });
        io.to("agent_room").emit('agentTyping', {
            room: data.room,
            username: data.agentName,
            "typing": true
        });
    });

    socket.on('agentJoined', (data) => {
        io.to(data.room).emit('agentJoined', {
            "typing": false
        });
    });

    socket.on('agentLeft', (data) => {
        io.to(data.room).emit('agentLeft', {
            "typing": false
        });
    });

    socket.on("resolvedNotification", (data) => {
        io.to("agent_room").emit("resolvedNotification", {
            sessionId: data.sessionId,
            assignedUser: data.username,
            status: "resolved"
        });
    });
};

export default socketHandler;
