import { Router } from 'express';
import { body } from 'express-validator';
import { createProfile, getProfile, updateProfile, deleteProfile } from '../controllers/awsProfile.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Apply auth middleware to all profile routes
router.use(authenticate);

const profileValidation = [
  body('accessKey').trim().notEmpty().withMessage('AWS Access Key ID is required.'),
  body('secretKey').trim().notEmpty().withMessage('AWS Secret Access Key is required.'),
  body('defaultRegion').optional().trim().notEmpty().withMessage('Default region cannot be empty if provided.')
];

const updateValidation = [
  body('accessKey').optional().trim().notEmpty().withMessage('Access key cannot be empty if provided.'),
  body('secretKey').optional().trim().notEmpty().withMessage('Secret key cannot be empty if provided.'),
  body('defaultRegion').optional().trim().notEmpty().withMessage('Default region cannot be empty if provided.')
];

router.post('/', profileValidation, createProfile);
router.get('/', getProfile);
router.put('/', updateValidation, updateProfile);
router.delete('/', deleteProfile);

export default router;
