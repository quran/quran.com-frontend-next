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
 * This function creates a signature using the request details, a specified URL, and a signature token.
 * It supports requests with bodies for methods like POST, PUT, PATCH, and DELETE.
 *
 * @param {NextApiRequest} req - The request object containing details of the HTTP request.
 * @param {string} url - The URL for which the signature is being generated.
 * @param {string} signatureToken - The token used to sign the request.
 * @param {string} [timestamp] - An optional timestamp to use for the signature. If not provided, the current time is used.
 * @returns {{ signature: string; timestamp: string }} - An object containing the generated signature and the timestamp used.
 */
const generateSignature = (
  req: NextApiRequest,
  url: string,
  signatureToken: string,
  timestamp?: string,
): { signature: string; timestamp: string } => {
  let currentTimestamp = timestamp;
  if (!timestamp) {
    currentTimestamp = new Date().getTime().toString();
  }
  let params = {};

  try {
    const methodsWithBody = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (methodsWithBody.includes(req.method)) {
      params = req.body || {};
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error parsing request body:', err);
  }

  const rawString = `${url}.${currentTimestamp}${recursiveSortedObjectToString(params)}`;
  const signature = CryptoJS.HmacSHA512(rawString, signatureToken);
  const encodedSignature = CryptoJS.enc.Base64.stringify(signature);

  return { signature: encodedSignature, timestamp: currentTimestamp };
};

export default generateSignature;
