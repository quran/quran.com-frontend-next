import CryptoJS from 'crypto-js';
import { NextApiRequest } from 'next';

/**
 * Recursively sorts an object and converts it to a string.
 *
 * @param {any} params - The object to be sorted and converted.
 * @returns {string} - The sorted object as a string.
 */
const recursiveSortedObjectToString = (params: any): string => {
  let result = '';
  Object.keys(params)
    .sort()
    .forEach((key) => {
      const value = params[key];
      if (typeof value === 'object' && value !== null) {
        result = `${result}${key}${recursiveSortedObjectToString(value)}`;
      } else {
        result = `${result}${key}${value}`;
      }
    });
  return result;
};

/**
 * Generates a signature for the given request.
 *
 * @param {NextApiRequest} req - The request object.
 * @returns {{ signature: string; timestamp: string }} - The generated signature and timestamp.
 */
/**
 * Generates a signature for the given request.
 *
 * @param {NextApiRequest} req - The request object.
 * @returns {{ signature: string; timestamp: string }} - The generated signature and timestamp.
 */
// Start of Selection
const generateSignature = (
  req: NextApiRequest,
  url: string,
): { signature: string; timestamp: string } => {
  const currentTimestamp = new Date().getTime().toString();
  let params = {};

  try {
    if (req.method === 'POST' || req.method === 'PUT') {
      params = req.body;
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error parsing request body:', err);
  }

  const rawString = `${url}.${currentTimestamp}${recursiveSortedObjectToString(params)}`;
  const signature = CryptoJS.HmacSHA512(rawString, process.env.SIGNATURE_TOKEN);
  const encodedSignature = CryptoJS.enc.Base64.stringify(signature);

  return { signature: encodedSignature, timestamp: currentTimestamp };
};

export default generateSignature;
