import { apiService } from '../services/apiService';

export const messageController = async (req, res) => {
    try {
        const response = await apiService.fetchMessages(req.body.session_id);
        res.json({ message: response.data.message || [] });
    } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};
