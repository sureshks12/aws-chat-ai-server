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
 * Fetch all chat history items for the logged-in user.
 * Endpoint: GET /api/history
 */
export const getHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const rawHistory = await prisma.chatHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    const history = rawHistory.map((item) => ({
      ...item,
      response: safeParse(item.response)
    }));

    res.status(200).json({
      count: history.length,
      history
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear all chat history items for the logged-in user.
 * Endpoint: DELETE /api/history
 */
export const deleteHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await prisma.chatHistory.deleteMany({
      where: { userId }
    });

    res.status(200).json({
      message: 'Chat history cleared successfully.',
      deletedCount: result.count
    });
  } catch (error) {
    next(error);
  }
};
