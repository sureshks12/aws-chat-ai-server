import { validationResult } from 'express-validator';
import prisma from '../config/db.js';
import { encrypt } from '../services/encryption.service.js';
import { AppError } from '../middleware/error.middleware.js';

/**
 * Create a new AWS Profile for the logged-in user.
 */
export const createProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { accessKey, secretKey, sessionToken, defaultRegion } = req.body;
    const userId = req.user.id;

    // Check if profile already exists for this user
    const existingProfile = await prisma.aWSProfile.findUnique({
      where: { userId }
    });

    if (existingProfile) {
      throw new AppError('AWS Profile already exists for this user. Use PUT to update.', 400);
    }

    // Encrypt AWS Secret Key before persisting
    const secretKeyEncrypted = encrypt(secretKey);

    const profile = await prisma.aWSProfile.create({
      data: {
        userId,
        accessKey,
        secretKeyEncrypted,
        sessionToken: sessionToken || null,
        defaultRegion: defaultRegion || 'ap-south-1'
      }
    });

    res.status(201).json({
      message: 'AWS Profile created successfully.',
      profile: {
        id: profile.id,
        accessKey: profile.accessKey,
        defaultRegion: profile.defaultRegion,
        hasSessionToken: !!profile.sessionToken,
        createdAt: profile.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch the AWS Profile details for the logged-in user.
 */
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const profile = await prisma.aWSProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      throw new AppError('AWS Profile not found for this user.', 404);
    }

    res.status(200).json({
      profile: {
        id: profile.id,
        accessKey: profile.accessKey,
        defaultRegion: profile.defaultRegion,
        hasSessionToken: !!profile.sessionToken,
        createdAt: profile.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing AWS Profile for the logged-in user.
 */
export const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { accessKey, secretKey, sessionToken, defaultRegion } = req.body;
    const userId = req.user.id;

    const existingProfile = await prisma.aWSProfile.findUnique({
      where: { userId }
    });

    if (!existingProfile) {
      throw new AppError('AWS Profile not found. Create one first.', 404);
    }

    const updateData = {};
    if (accessKey) updateData.accessKey = accessKey;
    if (secretKey) updateData.secretKeyEncrypted = encrypt(secretKey);
    if (sessionToken !== undefined) updateData.sessionToken = sessionToken || null;
    if (defaultRegion) updateData.defaultRegion = defaultRegion;

    const updatedProfile = await prisma.aWSProfile.update({
      where: { userId },
      data: updateData
    });

    res.status(200).json({
      message: 'AWS Profile updated successfully.',
      profile: {
        id: updatedProfile.id,
        accessKey: updatedProfile.accessKey,
        defaultRegion: updatedProfile.defaultRegion,
        hasSessionToken: !!updatedProfile.sessionToken,
        createdAt: updatedProfile.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete AWS Profile for logged-in user.
 */
export const deleteProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const existingProfile = await prisma.aWSProfile.findUnique({
      where: { userId }
    });

    if (!existingProfile) {
      throw new AppError('AWS Profile not found.', 404);
    }

    await prisma.aWSProfile.delete({
      where: { userId }
    });

    res.status(200).json({
      message: 'AWS Profile deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
