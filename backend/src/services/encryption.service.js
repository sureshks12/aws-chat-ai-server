import CryptoJS from 'crypto-js';

const getEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not defined.');
  }
  return key;
};

/**
 * Encrypt sensitive text (such as AWS Secret Access Key) using AES-256.
 * @param {string} text 
 * @returns {string} Encrypted ciphertext
 */
export const encrypt = (text) => {
  if (!text) return '';
  const key = getEncryptionKey();
  return CryptoJS.AES.encrypt(text, key).toString();
};

/**
 * Decrypt ciphertext to original string.
 * @param {string} ciphertext 
 * @returns {string} Decrypted text
 */
export const decrypt = (ciphertext) => {
  if (!ciphertext) return '';
  const key = getEncryptionKey();
  const bytes = CryptoJS.AES.decrypt(ciphertext, key);
  const originalText = bytes.toString(CryptoJS.enc.Utf8);
  if (!originalText) {
    throw new Error('Failed to decrypt data. Invalid ciphertext or encryption key.');
  }
  return originalText;
};
