import Script from 'next/script';

const ANALYTICS_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

const GoogleAnalyticsScript = () => (
  <Script src={`https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_ID}`} strategy="lazyOnload">
    {`window.dataLayer = window.dataLayer || [];
         function gtag(){dataLayer.push(arguments);}
         gtag('js', new Date());
         gtag('config', ${ANALYTICS_ID});`}
  </Script>
);

export default GoogleAnalyticsScript;
