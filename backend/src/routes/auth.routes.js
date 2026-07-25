import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Validation Rules
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').trim().isEmail().withMessage('Valid email address is required.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.')
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('Valid email address is required.'),
  body('password').notEmpty().withMessage('Password is required.')
];

// Public Endpoints
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected Endpoint
router.get('/me', authenticate, getMe);

export default router;
