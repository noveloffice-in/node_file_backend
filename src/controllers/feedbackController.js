import { apiService } from '../services/apiService.js';

export const feedbackController = async (req, res) => {
    try {
        const { sessionID, ratings, feedback } = req.body;
        const response = await apiService.updateFeedback(sessionID, ratings, feedback);
        res.json(response.message);
    } catch (err) {
        console.error('Error fetching utils:', err);
        res.status(500).json({ error: 'Failed to fetch utils' });
    }
};
