import i18nConfig from '../../i18n.json';

type ResolveCurrentLocaleInput = {
  fallbackLocale: string;
  pathname: string;
  routerLocale?: string;
  routerDefaultLocale?: string;
  routerLocales?: string[];
};

const getPathWithoutQueryOrHash = (pathname: string): string => pathname.split(/[?#]/)[0] || '';

const resolveCurrentLocale = ({
  fallbackLocale,
  pathname,
  routerLocale,
  routerDefaultLocale,
  routerLocales,
}: ResolveCurrentLocaleInput): string => {
  if (routerLocale) return routerLocale;

  const defaultLocale = (routerDefaultLocale || fallbackLocale || 'en').toLowerCase();
  const configuredLocales = ((i18nConfig.locales as string[]) || []).map((locale) =>
    locale.toLowerCase(),
  );
  const supportedLocales =
    routerLocales && routerLocales.length > 0
      ? routerLocales.map((locale) => locale.toLowerCase())
      : configuredLocales;
  const firstPathSegment = getPathWithoutQueryOrHash(pathname)
    .split('/')
    .filter(Boolean)[0]
    ?.toLowerCase();

  if (firstPathSegment && supportedLocales.includes(firstPathSegment)) {
    return firstPathSegment;
  }

  return defaultLocale;
};

export default resolveCurrentLocale;
