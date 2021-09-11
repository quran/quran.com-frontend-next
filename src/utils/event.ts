// Need to stopPropagation() to prevent the event from bubbling up to the parent container
// which cause dispatch `setIsMobileMinimizedForScrolling` to be called
// eslint-disable-next-line import/prefer-default-export
export const withStopPropagation = (cb: () => void) => (e) => {
  e.stopPropagation();
  cb();
};
