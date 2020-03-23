export const apiUrl = process.env.API_URL ?? 'http://localhost:3000';
export const makeUrl = (path: string) => `${apiUrl}${path}`;
