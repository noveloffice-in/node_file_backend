import { apiService } from '../services/apiService.js';

export const sessionController = async (req, res) => {
    const { os, ip, referrer } = req.body;
    try {
        const response = await apiService.createSession(os, ip, referrer);
        res.json(response.message);
    } catch (err) {
        console.error('Error fetching session:', err);
        res.status(500).json({ error: 'Failed to fetch session' });
    }
};
