import { Router } from 'express';
import {
    createPrompt,
    getUserPrompts,
    getPromptById,
    deletePrompt,
    toggleFavorite,
} from '../controllers/prompt.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All prompt routes require authentication
router.use(authenticate);

router.post('/', createPrompt);
router.get('/', getUserPrompts);
router.get('/:id', getPromptById);
router.delete('/:id', deletePrompt);
router.patch('/:id/favorite', toggleFavorite);

export default router;
