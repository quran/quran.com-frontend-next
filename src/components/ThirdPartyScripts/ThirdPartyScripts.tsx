import React from 'react';
import Script from 'next/script';

const ThirdPartyScripts = () => (
  <>
    <Script src="https://www.googletagmanager.com/gtag/js?id=UA-8496014-1" strategy="lazyOnload">
      {`window.dataLayer = window.dataLayer || [];
         function gtag(){dataLayer.push(arguments);}
         gtag('js', new Date());
         gtag('config', 'UA-8496014-1');`}
    </Script>
  </>
);

export default ThirdPartyScripts;
