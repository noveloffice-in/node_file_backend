import axios from 'axios';

const apiURL = process.env.API_URL;
const apiKey = process.env.API_KEY;
const apiSecret = process.env.API_SECRET;

// Utility function for making API requests
const apiRequest = async (endpoint, data) => {
    try {
        const response = await axios.post(
            `${apiURL}/api/method/ai_chat_assist.api.novel_ai_chat_assist.request_handler`,
            { ...data, request: endpoint },
            {
                headers: { Authorization: `token ${apiKey}:${apiSecret}` }
            }
        );
        return response.data;
    } catch (err) {
        console.error(`Error with ${endpoint}:`, err);
        throw new Error('API request failed');
    }
};

export const apiService = {
    createSession: (os, ip, referrer) => {
        return apiRequest('create_doc', { os, ip, referrer });
    },

    addLocation: (sessionID, accuracy, longitude, latitude) => {
        return apiRequest('add_location_details', { session_id: sessionID, accuracy, longitude, latitude });
    },

    fetchMessages: (sessionId) => {
        return apiRequest('fetch_messages', { session_id: sessionId });
    },

    saveMessage: (room, msg, username, messageType, agentEmail = "Guest", timeStamp) => {
        return apiRequest('save_message', { session_id: room, msg, user: username, message_type: messageType, agent_email: agentEmail, time_stamp: timeStamp });
    },

    addContactDetails: (sessionID, name, email, phone) => {
        return apiRequest('add_contact_details', { session_id: sessionID, name, email, phone });
    },

    getAssignedUsersAndOnlineAgents: () => {
        return apiRequest('get_assigned_users_and_online_agents', {});
    },

    utils: () => {
        return apiRequest('utils', {});
    },
    
    updateFeedback: (sessionID, ratings, feedback) => {
        return apiRequest('update_feedback', {session_id: sessionID, ratings, feedback});
    }
};
