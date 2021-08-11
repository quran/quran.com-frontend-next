export const getCurrentPath = () => {
  if (typeof window !== 'undefined') {
    return window.location.href;
  }
  return '';
};

export const getWindowOrigin = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
};
