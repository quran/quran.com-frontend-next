import React from 'react';

import Script from 'next/script';

const CLARITY_TRACKING_CODE = process.env.NEXT_PUBLIC_CLARITY_TRACKING_CODE;
const ENABLE_MICROSOFT_CLARITY = process.env.NEXT_PUBLIC_ENABLE_MICROSOFT_CLARITY === 'true';

const MicrosoftClarityScript = () => {
  if (!ENABLE_MICROSOFT_CLARITY) {
    return <></>;
  }
  return (
    <Script id="microsoft-clarity-script-code">
      {`(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "${CLARITY_TRACKING_CODE}");`}
    </Script>
  );
};

export default MicrosoftClarityScript;
