import { apiService } from '../services/apiService.js';

export const locationController = async (req, res) => {
    try {
        const { sessionID, accuracy, longitude, latitude } = req.body;
        const response = await apiService.addLocation(sessionID, accuracy, longitude, latitude);
        res.json(response.message);
    } catch (err) {
        console.error('Error fetching location details:', err);
        res.status(500).json({ error: 'Failed to fetch location details' });
    }
};
