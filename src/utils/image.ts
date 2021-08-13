const DEFAULT_COLOR1 = '#f7f7f7';
const DEFAULT_COLOR2 = '#d1d1d1';

/**
 * Convert a string to a base64.
 *
 * @param {string} str
 * @returns {string}
 */
const toBase64 = (str: string): string =>
  typeof window === 'undefined' ? Buffer.from(str).toString('base64') : window.btoa(str);

/**
 * Get the shimmer SVG.
 *
 * @param {number} w
 * @param {number} h
 * @param {string} color1
 * @param {string} color2
 * @returns {string}
 */
export const shimmer = (w: number, h: number, color1: string, color2: string): string => `
  <svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>
      <linearGradient id="g">
        <stop stop-color="${color1}" offset="20%" />
        <stop stop-color="${color2}" offset="50%" />
        <stop stop-color="${color1}" offset="70%" />
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="${color1}" />
    <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
    <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1.2s" repeatCount="indefinite"  />
  </svg>`;

/**
 * Get the blue data url that Next.js will use before loading the actual image.
 *
 * @param {number} h Height
 * @param {number} w Width
 * @param {string} color1
 * @param {string} color2
 * @returns {string}
 */
export const getBlurDataUrl = (
  h: number,
  w: number,
  color1: string = DEFAULT_COLOR1,
  color2: string = DEFAULT_COLOR2,
): string => `data:image/svg+xml;base64,${toBase64(shimmer(w, h, color1, color2))}`;
