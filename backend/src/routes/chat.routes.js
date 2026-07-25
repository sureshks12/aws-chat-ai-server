import { Router } from 'express';
import { body } from 'express-validator';
import { handleChatQuery } from '../controllers/chat.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

const chatValidation = [
  body('question').trim().notEmpty().withMessage('Question string is required.')
];

router.post('/', chatValidation, handleChatQuery);

export default router;
