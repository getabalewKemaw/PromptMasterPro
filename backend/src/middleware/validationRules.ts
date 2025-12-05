import { body, param, query } from 'express-validator';

/**
 * Validation rules for authentication endpoints
 */
export const registerValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),

    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Must be a valid email address')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),

    body('preferredLanguage')
        .optional()
        .isIn(['en', 'am', 'om', 'ti'])
        .withMessage('Invalid language code'),
];

export const loginValidation = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Must be a valid email address')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('Password is required'),
];

/**
 * Validation rules for prompt endpoints
 */
export const createPromptValidation = [
    body('inputText')
        .trim()
        .notEmpty()
        .withMessage('Input text is required')
        .isLength({ max: 5000 })
        .withMessage('Input text must not exceed 5000 characters'),

    body('promptText')
        .trim()
        .notEmpty()
        .withMessage('Prompt text is required')
        .isLength({ max: 10000 })
        .withMessage('Prompt text must not exceed 10000 characters'),

    body('languageInput')
        .optional()
        .isIn(['en', 'am', 'om', 'ti'])
        .withMessage('Invalid input language code'),

    body('languageOutput')
        .optional()
        .isIn(['en', 'am', 'om', 'ti'])
        .withMessage('Invalid output language code'),

    body('category')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Category must not exceed 50 characters'),
];

export const promptIdValidation = [
    param('id')
        .notEmpty()
        .withMessage('Prompt ID is required')
        .isUUID()
        .withMessage('Invalid prompt ID format'),
];

export const getUserPromptsValidation = [
    query('category')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Category must not exceed 50 characters'),

    query('favorite')
        .optional()
        .isBoolean()
        .withMessage('Favorite must be a boolean value'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),

    query('offset')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Offset must be a non-negative integer'),
];

/**
 * Validation rules for template endpoints
 */
export const templateIdValidation = [
    param('id')
        .notEmpty()
        .withMessage('Template ID is required')
        .isUUID()
        .withMessage('Invalid template ID format'),
];

export const templateCategoryValidation = [
    param('category')
        .trim()
        .notEmpty()
        .withMessage('Category is required')
        .isLength({ max: 50 })
        .withMessage('Category must not exceed 50 characters'),
];
