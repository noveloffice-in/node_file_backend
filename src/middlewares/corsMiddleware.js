import cors from 'cors';

const allowedOrigins = process.env.ALLOWED_ORIGINS;

const corsMiddleware = cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST']
});

export default corsMiddleware;
