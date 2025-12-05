import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

/**
 * Middleware to handle validation errors from express-validator
 */
export const validate = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => ({
            field: err.type === 'field' ? err.path : 'unknown',
            message: err.msg,
        }));

        res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            errors: errorMessages,
        });
        return;
    }

    next();
};

/**
 * Helper to run validation chains
 */
export const runValidation = (validations: ValidationChain[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Run all validations
        await Promise.all(validations.map(validation => validation.run(req)));

        // Check for errors
        validate(req, res, next);
    };
};
