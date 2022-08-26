import React from 'react';

import Script from 'next/script';

import GoogleAnalyticsScript from './GoogleAnalyticsScript';

const ThirdPartyScripts = () => (
  <>
    <GoogleAnalyticsScript />
    <Script
      id="gl-elements"
      src="https://www.givingloop.org/assets/js/gl_elements.js?org_id=1728"
      strategy="lazyOnload"
    />
    <Script
      id="giving-loop"
      dangerouslySetInnerHTML={{
        __html: `(function(gi,vi,n,g,l,oo,p){gi[l]=gi[l]||function(){(gi[l].q=gi[l].q||[]).push(arguments);gi.glObjName=l;},oo=vi.createElement(n),p=vi.getElementsByTagName(n)[0];oo.async=1;oo.src=g;oo.dataset.orgId=1728;p.parentNode.insertBefore(oo,p);oo.id="gl-donation-popup-script";})(window,document,"script","https://www.givingloop.org/js?"+Array(1).fill(null).map(()=>Math.random().toString(20).substr(2)).join(""),"givingloop"); `,
      }}
      strategy="lazyOnload"
    />
  </>
);

export default ThirdPartyScripts;
