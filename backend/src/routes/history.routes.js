import { Router } from 'express';
import { getHistory, deleteHistory } from '../controllers/history.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getHistory);
router.delete('/', deleteHistory);

export default router;
