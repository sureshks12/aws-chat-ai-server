import { validationResult } from 'express-validator';
import prisma from '../config/db.js';
import { decrypt } from '../services/encryption.service.js';
import geminiService from '../services/gemini.service.js';
import awsService from '../services/aws.service.js';
import { SUPPORTED_OPERATIONS } from '../config/aws.js';
import { AppError } from '../middleware/error.middleware.js';
import logger from '../utils/logger.js';

const safeStringify = (data) => (typeof data === 'string' ? data : JSON.stringify(data));

/**
 * Handles incoming natural language query for AWS infrastructure management.
 * Endpoint: POST /api/chat
 */
export const handleChatQuery = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { question } = req.body;
    const userId = req.user.id;

    // 1. Fetch user's AWS Profile
    const profile = await prisma.aWSProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      throw new AppError('AWS Profile is not configured. Please add your AWS credentials in AWS Profile settings first.', 400);
    }

    // 2. Decrypt secret key for AWS SDK client
    let secretKey;
    try {
      secretKey = decrypt(profile.secretKeyEncrypted);
    } catch (err) {
      throw new AppError('Failed to decrypt stored AWS credentials. Please re-configure your AWS profile.', 500);
    }

    // 3. Process natural language query via Gemini AI
    const analyzedIntent = await geminiService.analyzeQuery(question, profile.defaultRegion);
    logger.info(`Analyzed intent for user ${userId}:`, analyzedIntent);

    const { service, operation, region, filters } = analyzedIntent;

    // 4. Verify read-only access compliance
    const isSupported = SUPPORTED_OPERATIONS.includes(operation?.toLowerCase());

    if (!isSupported) {
      const unsupportedResponse = {
        message: "This POC supports only read-only AWS operations."
      };

      // Record audit log for rejected request
      await prisma.auditLog.create({
        data: {
          userId,
          service: service || 'ec2',
          operation: operation || 'unknown',
          requestJson: safeStringify(analyzedIntent),
          responseSummary: safeStringify(unsupportedResponse),
          status: 'REJECTED_UNSUPPORTED'
        }
      });

      // Record chat history
      await prisma.chatHistory.create({
        data: {
          userId,
          question,
          response: safeStringify(unsupportedResponse)
        }
      });

      return res.status(200).json(unsupportedResponse);
    }

    // 5. Execute AWS Read-Only Operation
    let awsResponseData;
    let executionStatus = 'SUCCESS';

    try {
      const ec2Client = awsService.createEC2Client({
        accessKeyId: profile.accessKey,
        secretAccessKey: secretKey,
        sessionToken: profile.sessionToken,
        region: region || profile.defaultRegion
      });

      awsResponseData = await awsService.describeInstances(ec2Client, filters);
    } catch (awsError) {
      logger.error('AWS SDK Execution Error:', awsError);
      executionStatus = 'FAILED';
      awsResponseData = {
        error: true,
        message: awsError.message || 'Failed to execute AWS operation.',
        code: awsError.name || 'AWS_EXECUTION_ERROR'
      };
    }

    const finalResponse = {
      intent: {
        service,
        operation,
        region,
        filters
      },
      result: awsResponseData
    };

    // 6. Save Chat History
    await prisma.chatHistory.create({
      data: {
        userId,
        question,
        response: safeStringify(finalResponse)
      }
    });

    // 7. Save Audit Log
    await prisma.auditLog.create({
      data: {
        userId,
        service: service || 'ec2',
        operation: operation || 'describe_instances',
        requestJson: safeStringify(analyzedIntent),
        responseSummary: safeStringify({
          status: executionStatus,
          totalInstancesFound: awsResponseData.totalInstances ?? 0,
          region
        }),
        status: executionStatus
      }
    });

    return res.status(200).json(finalResponse);
  } catch (error) {
    next(error);
  }
};
