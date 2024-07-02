const LOCALE_COOKIE_PERSISTENCE_PERIOD_MS = 86400000000000; // maximum milliseconds-since-the-epoch value https://stackoverflow.com/a/56980560/1931451

// eslint-disable-next-line import/prefer-default-export
export const setLocaleCookie = (newLocale: string) => {
  const date = new Date();
  date.setTime(LOCALE_COOKIE_PERSISTENCE_PERIOD_MS);
  // eslint-disable-next-line i18next/no-literal-string
  document.cookie = `NEXT_LOCALE=${newLocale};expires=${date.toUTCString()};path=/`;
};
