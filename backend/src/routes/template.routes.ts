import { Router } from 'express';
import {
    getAllTemplates,
    getTemplatesByCategory,
    getTemplateById,
} from '../controllers/template.controller';

const router = Router();

// Public routes - templates are accessible to all users
router.get('/', getAllTemplates);
router.get('/category/:category', getTemplatesByCategory);
router.get('/:id', getTemplateById);

export default router;
