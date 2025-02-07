import { apiService } from '../services/apiService.js';

export const contactDetailsController = async (req, res) => {
    try {
        const { sessionID, name, email, phone } = req.body;
        console.log(sessionID, name, email, phone);
        const response = await apiService.addContactDetails(sessionID, name, email, phone);
        res.json(response.message);
    } catch (err) {
        console.error('Error fetching location details:', err);
        res.status(500).json({ error: 'Failed to fetch location details' });
    }
};
