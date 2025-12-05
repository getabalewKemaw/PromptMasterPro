import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import promptRoutes from './routes/prompt.routes';
import templateRoutes from './routes/template.routes';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './middleware/logger';
import { apiLimiter } from './middleware/rateLimiter';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);
app.use(apiLimiter); // Apply rate limiting to all routes

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'success',
        message: 'PromptMaster Pro API is running',
        timestamp: new Date().toISOString(),
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/templates', templateRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found',
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;
