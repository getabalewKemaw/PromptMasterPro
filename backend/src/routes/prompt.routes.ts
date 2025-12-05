import { Router } from 'express';
import { upload } from '../middleware/upload';
import {
    createPrompt,
    getUserPrompts,
    getPromptById,
    deletePrompt,
    toggleFavorite,
    improvePromptText,
    processVoicePrompt,
} from '../controllers/prompt.controller';
import { authenticate } from '../middleware/auth';
import { aiLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validator';
import {
    createPromptValidation,
    promptIdValidation,
    getUserPromptsValidation,
} from '../middleware/validationRules';

const router = Router();

// All prompt routes require authentication
router.use(authenticate);

router.post('/', aiLimiter, createPromptValidation, validate, createPrompt);
router.get('/', getUserPromptsValidation, validate, getUserPrompts);
router.get('/:id', promptIdValidation, validate, getPromptById);
router.delete('/:id', promptIdValidation, validate, deletePrompt);
router.patch('/:id/favorite', promptIdValidation, validate, toggleFavorite);
router.post('/improve', aiLimiter, validate, improvePromptText);
router.post('/voice', aiLimiter, upload.single('audio'), processVoicePrompt);

export default router;
