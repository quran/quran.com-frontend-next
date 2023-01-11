// A utility to check if the code is running on the client (vs. nextjs server)
const isClient = !!(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
);

export default isClient;
