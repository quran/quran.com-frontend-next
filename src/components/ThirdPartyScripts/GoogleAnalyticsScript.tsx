/* eslint-disable i18next/no-literal-string */
import Script from 'next/script';

const ANALYTICS_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
const ENABLE_ANALYTICS = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';

const GoogleAnalyticsScript = () => {
  if (!ENABLE_ANALYTICS) {
    return <></>;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_ID}`}
        strategy="lazyOnload"
        id="google-analytics-script-url"
      />
      <Script id="google-analytics-script-code">
        {`window.dataLayer = window.dataLayer || [];
         function gtag(){dataLayer.push(arguments);}
         gtag('js', new Date());
         gtag('config', '${ANALYTICS_ID}', {
            page_path: window.location.pathname,
         });`}
      </Script>
    </>
  );
};

export default GoogleAnalyticsScript;
