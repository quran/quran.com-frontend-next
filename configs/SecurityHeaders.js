/*
  - default-src: a fallback for all other directives.
    - 'self': Refers to the origin from which the protected document is being served, including the same URL scheme and port number.
  - script-src: specifies the valid sources of JS running either inside <script> elements or inline script event handlers (onclick).
    - 'unsafe-inline' allows the use of inline resources.
    - 'unsafe-eval' is needed otherwise custom JS variables by google analytics will yield to undefined.
  - img-src: specifies valid sources of images and favicons. We allow all sources. besides inline images using :data.
    - data: Allows data: URIs to be used as a content source. Currently we use data to embed some images inline e.g. the App Store images in the Side Menu Drawer.
  - media-src: specifies valid sources for loading media using the <audio> and <video> elements. Currently we only allow audio from quranicaudio.com.
  - connect-src: restricts the URLs that we can connect to using script interfaces including <a>, XMLHttpRequest, WebSocket. Currently we allow all URLs.
*/
const ContentSecurityPolicy = `
  default-src 'self' *.qurancdn.com cdn.plaid.com;
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://ssl.google-analytics.com https://vitals.vercel-insights.com  https://www.givingloop.org https://code.jquery.com https://www.google.com https://js.stripe.com https://ipinfo.io https://snap.licdn.com https://cdn.mouseflow.com https://www.paypal.com  https://wchat.eu.freshchat.com https://cdn.plaid.com https://cdnjs.cloudflare.com https://cdn.amplitude.com https://cdn.logrocket.io https://www.gstatic.com https://js.stripe.com;
  font-src 'self' 'unsafe-inline' 'unsafe-eval' givingloop.org fonts.gstatic.com https://www.givingloop.org;
  frame-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com/v3 js.stripe.com  https://www.paypal.com www.paypal.com https://wchat.eu.freshchat.com https://www.google.com www.google.com www.youtube.com;
  style-src 'self' 'unsafe-inline' 'unsafe-eval' *.givingloop.org givingloop.org fonts.googleapis.com fonts.googleapis.com wchat.eu.freshchat.com;
  img-src * data:;
  media-src 'self' data: blob: *.quranicaudio.com *.qurancdn.com https://qurancdn.com https://images.quran.com;
  connect-src *;
`;

const securityHeaders = [
  // Protects from XSS attacks. See: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\n/g, ''),
  },
  // Controls how much information the browser includes when navigating away from a document. See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin', // Will Send the origin, path, and query string when performing a same-origin request to the same protocol level e.g. https://www.quran.com/search?page=1&language=en&query=Allah; otherwise, will only send base url e.g. https://www.quran.com.
  },
  // Indicate that Content-Type headers should not be changed and be followed. See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff', // disallow overriding response Content-Type headers to guess and process the data using an implicit content type.
  },
  // Controls DNS pre-fetching, allowing browsers to proactively perform domain name resolution on external links, images, CSS etc which reduces latency when the user clicks a link. See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-DNS-Prefetch-Control
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  // Controls which features and APIs can be used in the browser. See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy and https://github.com/w3c/webappsec-permissions-policy/blob/main/permissions-policy-explainer.md
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(self), geolocation=(self), fullscreen=*', // camera is disabled for all, microphone only for the current origin, geolocation only for the current origin and fullscreen for all including iframes.
  },
];

module.exports = securityHeaders;
