import { Router } from 'express';
import { register, login, getProfile } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validator';
import { registerValidation, loginValidation } from '../middleware/validationRules';

const router = Router();

// Public routes with rate limiting and validation
router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);

// Protected routes
router.get('/profile', authenticate, getProfile);

export default router;
