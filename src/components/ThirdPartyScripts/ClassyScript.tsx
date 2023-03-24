import React from 'react';

import Script from 'next/script';

const ClassyScript = () => {
  return <Script id="classy" src="/classy.js" strategy="lazyOnload" />;
};

export default ClassyScript;
