/* eslint-disable unicorn/no-array-reduce */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
/* eslint-disable no-param-reassign */
/* eslint-disable func-names */
(function (win) {
  win.egProps = {
    campaigns: [
      {
        campaignId: '472825',
        donation: {
          modal: {
            urlParams: { egrn: true },
            elementSelector: '.donate-button, .donate-button >*',
          },
        },
      },
    ],
  };

  win.document.body.appendChild(makeEGScript());

  function makeEGScript() {
    const egScript = win.document.createElement('script');
    egScript.setAttribute('type', 'text/javascript');
    egScript.setAttribute('async', 'true');
    egScript.setAttribute('src', 'https://sdk.classy.org/embedded-giving.js');
    return egScript;
  }

  function readURLParams() {
    const searchParams = new URLSearchParams(location.search);

    const validUrlParams = ['c_src', 'c_src2'];

    return validUrlParams.reduce((urlParamsSoFar, validKey) => {
      const value = searchParams.get(validKey);
      return value === null ? urlParamsSoFar : { ...urlParamsSoFar, [validKey]: value };
    }, {});
  }
})(window);
