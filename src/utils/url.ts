/* eslint-disable import/prefer-default-export */
export const getCurrentPath = () => {
  if (typeof window !== 'undefined') {
    return window.location.href;
  }
  return '';
};
