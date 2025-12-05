import { Router } from 'express';
import {
    getAllTemplates,
    getTemplatesByCategory,
    getTemplateById,
} from '../controllers/template.controller';
import { validate } from '../middleware/validator';
import {
    templateIdValidation,
    templateCategoryValidation,
} from '../middleware/validationRules';

const router = Router();

// Public routes - templates are accessible to all users
router.get('/', getAllTemplates);
router.get('/category/:category', templateCategoryValidation, validate, getTemplatesByCategory);
router.get('/:id', templateIdValidation, validate, getTemplateById);

export default router;
