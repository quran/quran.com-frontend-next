import Script from 'next/script';

const ENABLE_HOTJAR = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';

const HotjarScript = () => {
  if (!ENABLE_HOTJAR) {
    return <></>;
  }

  return (
    <Script strategy="lazyOnload" id="hotjar-script">
      {`(function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:2578202,hjsv:6};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`}
    </Script>
  );
};

export default HotjarScript;
