import prisma from '../config/db.js';

const safeParse = (data) => {
  if (!data) return {};
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (e) {
      return data;
    }
  }
  return data;
};

/**
 * Fetch audit logs for the logged-in user.
 * Endpoint: GET /api/audit
 */
export const getAuditLogs = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const rawLogs = await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    const logs = rawLogs.map((log) => ({
      ...log,
      requestJson: safeParse(log.requestJson),
      responseSummary: safeParse(log.responseSummary)
    }));

    res.status(200).json({
      count: logs.length,
      logs
    });
  } catch (error) {
    next(error);
  }
};
