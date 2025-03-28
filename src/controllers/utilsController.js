import { apiService } from '../services/apiService.js';

export const utilsController = async (req, res) => {
    try {
        const response = await apiService.utils();
        res.json(response.message);
    } catch (err) {
        console.error('Error fetching utils:', err);
        res.status(500).json({ error: 'Failed to fetch utils' });
    }
};
