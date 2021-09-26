const useScrollToTop = () => {
  // a function that will be invoked by the component using this hook to scroll to the top of the window.
  const scrollToTop = (): void => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  };

  return scrollToTop;
};
export default useScrollToTop;
