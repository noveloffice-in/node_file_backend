import { apiService } from '../services/apiService.js';

export const sessionController = async (req, res) => {
    const { os, ip } = req.body;
    try {
        const response = await apiService.createSession(os, ip);
        res.json(response.message);
    } catch (err) {
        console.error('Error fetching session:', err);
        res.status(500).json({ error: 'Failed to fetch session' });
    }
};
