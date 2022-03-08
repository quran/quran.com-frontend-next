const ANALYTICS_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

// eslint-disable-next-line import/prefer-default-export
export const pageView = (url: string) => {
  if (window.gtag) {
    window.gtag('config', ANALYTICS_ID, {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      page_path: url,
    });
  }
};
