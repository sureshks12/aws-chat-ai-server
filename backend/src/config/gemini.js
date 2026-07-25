import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Initializes and exports the Google Generative AI client.
 */
export const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenerativeAI(apiKey);
};
