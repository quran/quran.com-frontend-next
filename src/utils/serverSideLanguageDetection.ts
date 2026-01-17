/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable max-lines */
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import { getCountryLanguagePreference } from '@/api';
import { logInfo, logError, logDebug, logTransaction } from '@/lib/newrelic';
import { logErrorToSentry } from '@/lib/sentry';
import Language from '@/types/Language';
import i18nConfig from 'i18n.json';
import { CountryLanguagePreferenceResponse } from 'types/ApiResponses';

/**
 * # Server-Side Language Detection System
 *
 * This module provides automatic language detection and redirection for server-side rendered pages.
 * It intelligently detects user's preferred language and redirects them to the appropriate locale
 * while respecting manual language selections.
 *
 * ## How It Works
 *
 * ### 1. Language Detection Flow
 * ```
 * User Request → Accept-Language Header → Parse Language/Country → Check Manual Selection
 *     ↓
 * Should Redirect? → API Validation → Redirect OR Continue with Current Locale
 *     ↓
 * Fetch Country Preference → Return Props → Render Page
 * ```
 *
 * ### 2. Key Decision Points
 *
 * **Redirect Decision Criteria:**
 * - User has NOT manually selected a language (no NEXT_LOCALE cookie)
 * - Detected language differs from current page locale
 * - Detected language is supported in our i18n configuration
 * - API validates the language/country combination
 *
 * **No Redirect Scenarios:**
 * - User previously chose a language manually
 * - Detected language matches current locale
 * - Detected language is not supported
 * - API validation fails
 *
 * ### 3. Error Handling
 * - All API failures are logged to Sentry but don't break the page
 * - Graceful degradation: page renders without country preference data if needed
 * - Temporary redirects (302) since language preferences can change
 *
 * ## Usage Examples
 *
 * ### Basic Usage (no additional props)
 * ```typescript
 * export const getServerSideProps = withLanguageDetection('/about-us');
 * ```
 *
 * ### With Additional Props
 * ```typescript
 * export const getServerSideProps = withLanguageDetection(
 *   '/blog',
 *   async (context, languageResult) => {
 *     const posts = await getBlogPosts(context.locale);
 *     return { posts };
 *   }
 * );
 * ```
 *
 * ### Using Language Detection Results
 * ```typescript
 * export const getServerSideProps = withLanguageDetection(
 *   '/products',
 *   async (context, { detectedLanguage, detectedCountry }) => {
 *     // Customize data fetching based on detected region
 *     const products = await getProductsByRegion(detectedCountry);
 *     return { products };
 *   }
 * );
 * ```
 *
 * ## Language/Country Mapping
 *
 * The system uses a fallback mapping for languages without explicit country codes:
 * - `en` → `US` (English → United States)
 * - `ar` → `SA` (Arabic → Saudi Arabia)
 * - `ur` → `PK` (Urdu → Pakistan)
 * - `fa` → `IR` (Persian → Iran)
 * - And more...
 *
 * ## Performance Considerations
 *
 * - API calls are cached and optimized
 * - Failed API calls don't block page rendering
 * - Redirects are temporary to allow for preference changes
 * - Manual language selections are respected to avoid redirect loops
 *
 * @module ServerSideLanguageDetection
 */

const { locales } = i18nConfig;

export interface LanguageDetectionResult {
  detectedLanguage: string;
  detectedCountry: string;
  countryLanguagePreference?: CountryLanguagePreferenceResponse;
  shouldRedirect: boolean;
  redirectDestination?: string;
}

// Add constants for header names and default values
const HEADERS = {
  ACCEPT_LANGUAGE: 'accept-language',
  CLOUDFLARE_COUNTRY: 'cf-ipcountry', // Node.js converts headers to lowercase
  COOKIE: 'cookie',
} as const;

type DefaultLanguage = Language.EN;
type DefaultCountry = 'US';

const DEFAULT_VALUES = {
  LANGUAGE: Language.EN as DefaultLanguage,
  COUNTRY: 'US' as DefaultCountry,
  ACCEPT_LANGUAGE: 'en-US,en;q=0.9',
} as const;

/**
 * Helper function to detect user's device language and country from request headers
 *
 * Parses the Accept-Language header for language and uses Cloudflare's CF-IPCountry header
 * for country detection. If country is not available from Cloudflare, uses fallback mapping.
 *
 * **Examples:**
 * - Accept-Language: "en-US,en;q=0.9" + CF-IPCountry: "US" → { detectedLanguage: "en", detectedCountry: "US" }
 * - Accept-Language: "ar" + CF-IPCountry: "SA" → { detectedLanguage: "ar", detectedCountry: "SA" }
 * - Accept-Language: "fr-CA,fr;q=0.9" + CF-IPCountry: "CA" → { detectedLanguage: "fr", detectedCountry: "CA" }
 *
 * @param {string} acceptLanguageHeader the Accept-Language header value
 * @param {string} cloudflareCountryHeader the CF-IPCountry header value from Cloudflare
 * @returns {{ detectedLanguage: string; detectedCountry: string }} detected language and country
 */
// eslint-disable-next-line react-func/max-lines-per-function
export const detectUserLanguageAndCountry = (
  acceptLanguageHeader: string,
  cloudflareCountryHeader?: string,
): { detectedLanguage: string; detectedCountry: string } => {
  logDebug('Starting language and country detection', {
    acceptLanguageHeader,
    cloudflareCountryHeader,
  });

  const primaryLanguage = acceptLanguageHeader.split(',')[0] || DEFAULT_VALUES.ACCEPT_LANGUAGE;
  let detectedLanguage: string = DEFAULT_VALUES.LANGUAGE;
  let detectedCountry: string = DEFAULT_VALUES.COUNTRY;

  // Extract language from Accept-Language header
  if (primaryLanguage.includes('-')) {
    // Extract language code from locale string (e.g., 'en-US' -> 'en')
    const languageCode = primaryLanguage.split('-')[0];
    detectedLanguage = locales.includes(languageCode) ? languageCode : DEFAULT_VALUES.LANGUAGE;
    logDebug('Extracted language from locale string', {
      primaryLanguage,
      languageCode,
      detectedLanguage,
      isSupported: locales.includes(languageCode),
    });
  } else {
    // Use language code directly (e.g., 'en' -> 'en')
    detectedLanguage = locales.includes(primaryLanguage)
      ? primaryLanguage
      : DEFAULT_VALUES.LANGUAGE;
    logDebug('Using language code directly', {
      primaryLanguage,
      detectedLanguage,
      isSupported: locales.includes(primaryLanguage),
    });
  }

  // Country detection logic based on product specifications:
  // - English: Use detected country (important for country-specific preferences)
  // - Non-English supported languages: Ignore country, use detected language settings
  // - Unsupported languages: Use detected country (treated as English fallback)

  const isEnglish = detectedLanguage === Language.EN;
  const isUnsupportedLanguage = !locales.includes(detectedLanguage);
  const isSupportedNonEnglish = locales.includes(detectedLanguage) && !isEnglish;

  if (isEnglish || isUnsupportedLanguage) {
    // For English or unsupported languages: Use actual detected country
    if (cloudflareCountryHeader) {
      detectedCountry = cloudflareCountryHeader.toUpperCase() as DefaultCountry;
      logDebug('Using Cloudflare country detection for English/unsupported language', {
        detectedCountry,
        isEnglish,
        isUnsupportedLanguage,
      });
    } else {
      detectedCountry = DEFAULT_VALUES.COUNTRY; // Fallback to US
      logDebug('Using fallback country for English/unsupported language', {
        detectedCountry,
        isEnglish,
        isUnsupportedLanguage,
      });
    }
  } else if (isSupportedNonEnglish) {
    // For non-English supported languages: Use 'US' as default country (ignore actual country)
    // This ensures language-specific defaults are applied regardless of user's location
    detectedCountry = DEFAULT_VALUES.COUNTRY;
    logDebug('Using default country for non-English supported language', {
      detectedLanguage,
      detectedCountry,
      reason: 'language-specific defaults take precedence over country',
    });
  }

  return { detectedLanguage, detectedCountry };
};

/**
 * Determine which country code should be used when requesting default settings.
 *
 * Product rules:
 * - English (or unsupported languages that fall back to English) should use the
 *   actual detected country so we can serve country-specific defaults.
 * - Supported non-English languages ignore the user's country and always use
 *   the generic language defaults (US).
 *
 * This helper centralizes that logic so that both server- and client-side flows
 * stay perfectly aligned.
 *
 * @param {string} language the language we want defaults for
 * @param {string} detectedCountry the country detected
 * @returns {string} the country code that should be sent to the API
 */
export const getCountryCodeForPreferences = (
  language: string,
  detectedCountry?: string,
): string => {
  const normalizedCountry = (detectedCountry || DEFAULT_VALUES.COUNTRY).toUpperCase();
  const isEnglish = language === Language.EN;
  const isSupportedLanguage = locales.includes(language);

  if (isEnglish || !isSupportedLanguage) {
    return normalizedCountry;
  }

  return DEFAULT_VALUES.COUNTRY;
};

/**
 * Helper function to check if user has manually selected a language
 *
 * Checks for the presence of NEXT_LOCALE cookie which Next.js sets when a user
 * manually changes their language preference. This prevents automatic redirects
 * from overriding user's explicit choice.
 *
 * **Why this matters:** Without this check, users would be stuck in redirect loops
 * if their browser language differs from their preferred site language.
 *
 * @param {string} cookieHeader the cookie header value
 * @returns {boolean} true if user has manually selected a language
 */
export const hasManualLanguageSelection = (cookieHeader?: string): boolean => {
  if (!cookieHeader) return false;

  const hasSelection = cookieHeader.includes('NEXT_LOCALE');
  logDebug('Checking manual language selection', { hasSelection });
  return hasSelection;
};

/**
 * Helper function to determine if we should redirect to a different locale
 *
 * This is the core decision logic that determines whether to redirect a user.
 * It implements a respectful approach to language detection by:
 *
 * 1. **Respecting user choice** - Never redirects if user manually selected a language
 * 2. **Avoiding unnecessary redirects** - Skips redirect if already on correct language
 * 3. **Supporting only valid languages** - Only redirects to languages we actually support
 *
 * **Decision Tree:**
 * - Has manual selection? → No redirect
 * - Same as current? → No redirect
 * - Unsupported language? → No redirect
 * - Otherwise → Redirect
 *
 * @param {string} currentLocale the current locale
 * @param {string} detectedLanguage the detected language
 * @param {boolean} hasManualSelection whether user has manually selected a language
 * @returns {boolean} true if should redirect to detected locale
 */
export const shouldRedirectToLocale = (
  currentLocale: string,
  detectedLanguage: string,
  hasManualSelection: boolean,
): boolean => {
  logDebug('Evaluating redirect decision', {
    currentLocale,
    detectedLanguage,
    hasManualSelection,
    isSupported: locales.includes(detectedLanguage),
  });

  // Don't redirect if user has manually selected a language
  if (hasManualSelection) {
    logInfo('No redirect: User has manual language selection');
    return false;
  }

  // Don't redirect if detected language is the same as current locale
  if (detectedLanguage === currentLocale) {
    logInfo('No redirect: Detected language matches current locale');
    return false;
  }

  // Don't redirect if detected language is not supported
  if (!locales.includes(detectedLanguage)) {
    logInfo('No redirect: Detected language not supported', { detectedLanguage });
    return false;
  }

  logInfo('Redirect needed: Language change required', {
    from: currentLocale,
    to: detectedLanguage,
  });
  return true;
};

/**
 * Performs server-side language detection and determines if a redirect is needed
 *
 * This is the main orchestrator function that coordinates the entire language detection flow:
 *
 * **Flow Steps:**
 * 1. Extract and parse Accept-Language header
 * 2. Check for manual language selection (NEXT_LOCALE cookie)
 * 3. Determine if redirect is needed based on detection rules
 * 4. Determine final locale (detected if redirecting, current if not)
 * 5. Fetch country preference for final locale via single API call
 * 6. If API succeeds and redirect needed: return redirect response
 * 7. If API fails and redirect was needed: disable redirect, continue with current locale
 * 8. Otherwise: continue with current locale and available country preference data
 *
 * **API Integration:**
 * - Makes a single call to `getCountryLanguagePreference` for the final locale
 * - On API success: Always returns country preference data; redirects if needed
 * - On API failure: Logs error to Sentry, disables redirect, continues without preference data
 *
 * **Error Resilience:**
 * All API failures are caught, logged, and don't prevent page rendering.
 * If API fails during redirect validation, the redirect is skipped.
 * The page will render without country preference data if API fails.
 *
 * **Dynamic Route Handling:**
 * For redirects, uses the actual resolved URL from the request context instead of
 * the route pattern to properly handle dynamic routes like `/[chapterId]`.
 *
 * @param {GetServerSidePropsContext} context Next.js server-side props context
 * @param {string} pagePath the current page path pattern (e.g., '/[chapterId]', '/about-us') - used as fallback for logging
 * @returns {Promise<LanguageDetectionResult>} language detection result
 */
// eslint-disable-next-line react-func/max-lines-per-function
export const performLanguageDetection = async (
  context: GetServerSidePropsContext,
  pagePath: string,
): Promise<LanguageDetectionResult> => {
  return logTransaction('performLanguageDetection', 'LanguageDetection', async () => {
    const { req, locale } = context;
    logInfo('Starting language detection', { pagePath, currentLocale: locale });

    try {
      // STEP 1: Extract user's preferred language and country from headers
      const acceptLanguage =
        (req.headers[HEADERS.ACCEPT_LANGUAGE] as string) || DEFAULT_VALUES.ACCEPT_LANGUAGE;
      const cloudflareCountry = req.headers[HEADERS.CLOUDFLARE_COUNTRY] as string | undefined;
      const { detectedLanguage: deviceLanguage, detectedCountry } = detectUserLanguageAndCountry(
        acceptLanguage,
        cloudflareCountry,
      );
      logInfo('Detected language and country', {
        detectedLanguage: deviceLanguage,
        detectedCountry,
      });
      const currentLocale = locale || DEFAULT_VALUES.LANGUAGE;

      // STEP 2: Check if user has manually overridden language selection
      const hasManualSelection = hasManualLanguageSelection(req.headers[HEADERS.COOKIE] as string);
      logInfo('Manual language selection check', { hasManualSelection });

      // STEP 3: Fetch country preference, extract API-suggested locale, and determine effective locale
      const localeForPreferences = hasManualSelection ? currentLocale : deviceLanguage;
      const countryForPreferences = getCountryCodeForPreferences(
        localeForPreferences,
        detectedCountry,
      );
      let countryLanguagePreference: CountryLanguagePreferenceResponse | undefined;
      let apiSuggestedLocale: string | undefined;
      let apiFailed = false;

      try {
        countryLanguagePreference = await getCountryLanguagePreference(
          localeForPreferences,
          countryForPreferences,
        );
        logInfo('Fetched country preference for final locale', {
          finalLocale: localeForPreferences,
          detectedCountry: countryForPreferences,
          countryLanguagePreference,
        });

        // Only use API-suggested locale for auto-detection; respect user's manual selection
        if (!hasManualSelection) {
          apiSuggestedLocale =
            countryLanguagePreference?.defaultLocale &&
            typeof countryLanguagePreference.defaultLocale === 'string' &&
            countryLanguagePreference.defaultLocale.trim() !== '' &&
            locales.includes(countryLanguagePreference.defaultLocale)
              ? countryLanguagePreference.defaultLocale
              : undefined;
        }
      } catch (error) {
        handleCountryPreferenceError(error, localeForPreferences, countryForPreferences, pagePath);
        apiFailed = true;
      }

      // Determine the effective locale for the site using API defaultLocale when available
      const effectiveLocale = hasManualSelection
        ? currentLocale
        : apiSuggestedLocale || deviceLanguage;

      // STEP 4: Evaluate redirect conditions (includes API failure handling)
      const shouldRedirect = shouldRedirectToLocale(
        currentLocale,
        effectiveLocale,
        hasManualSelection,
      );
      const canRedirect = shouldRedirect && !apiFailed;

      if (!canRedirect && shouldRedirect) {
        logInfo('Redirect disabled due to API failure', {
          effectiveLocale,
          detectedCountry: countryForPreferences,
        });
      }

      // STEP 5: Handle redirect if needed and API call succeeded
      if (canRedirect) {
        // Use the actual resolved URL instead of pagePath to handle dynamic routes
        const actualPath = context.resolvedUrl || context.req.url || pagePath;
        const redirectPath = `/${effectiveLocale}${actualPath}`;
        logInfo('Language redirect with country preference', {
          detectedLanguage: effectiveLocale,
          detectedCountry,
          redirectPath,
          actualPath,
        });

        return {
          detectedLanguage: effectiveLocale,
          detectedCountry,
          countryLanguagePreference,
          shouldRedirect: true,
          redirectDestination: redirectPath,
        };
      }

      // STEP 6: No redirect needed - continue with current locale
      return {
        detectedLanguage: effectiveLocale,
        detectedCountry,
        countryLanguagePreference,
        shouldRedirect: false,
      };
    } catch (error) {
      // Handle any unexpected errors
      logError('Unexpected error in language detection', error as Error, {
        pagePath,
        locale,
      });
      logErrorToSentry(error, {
        metadata: {
          context: 'language detection - unexpected error',
          pagePath,
          locale,
        },
        transactionName: 'performLanguageDetection',
      });

      // Return default values on error
      return {
        detectedLanguage: DEFAULT_VALUES.LANGUAGE,
        detectedCountry: DEFAULT_VALUES.COUNTRY,
        shouldRedirect: false,
      };
    }
  });
};

/**
 * Helper function to handle country preference API errors
 */
const handleCountryPreferenceError = (
  error: unknown,
  locale: string,
  detectedCountry: string,
  pagePath: string,
): void => {
  if (error instanceof Response) {
    error.text().then((errorMessage) => {
      try {
        const errorData = JSON.parse(errorMessage);
        logError(
          'Failed to fetch country preference',
          new Error(errorData.message || 'Unknown error'),
          {
            currentLocale: locale,
            detectedCountry,
            pagePath,
            errorDetails: errorData.details,
            errorType: errorData.type,
          },
        );
      } catch (parseError) {
        logError('Failed to fetch country preference', new Error(errorMessage), {
          currentLocale: locale,
          detectedCountry,
          pagePath,
        });
      }
    });
  } else {
    logError('Failed to fetch country preference', error as Error, {
      currentLocale: locale,
      detectedCountry,
      pagePath,
    });
  }
  logErrorToSentry(error, {
    metadata: {
      context: 'language detection - current locale preference',
      currentLocale: locale,
      detectedCountry,
      pagePath,
    },
    transactionName: 'performLanguageDetection',
  });
};

/**
 * HOC that wraps getServerSideProps to add language detection and redirection
 *
 * Automatically detects user's preferred language and redirects to the appropriate locale
 * while respecting manual language selections. For dynamic routes, uses the actual resolved
 * URL for redirects to ensure proper route parameter handling.
 *
 * @param {string} pagePath the current page path pattern (e.g., '/[chapterId]', '/about-us') - used for logging
 * @param {Function} getPropsFunction optional function to get additional props
 * @returns {Function} wrapped getServerSideProps function
 *
 * @example
 * // Simple usage for static routes:
 * export const getServerSideProps = withLanguageDetection('/about-us');
 *
 * @example
 * // Usage for dynamic routes:
 * export const getServerSideProps = withLanguageDetection('/[chapterId]');
 *
 * @example
 * // With additional props:
 * export const getServerSideProps = withLanguageDetection(
 *   '/blog',
 *   async (context, languageResult) => {
 *     const posts = await getBlogPosts(context.locale);
 *     return { posts };
 *   }
 * );
 *
 * @example
 * // With complex props and using language detection result:
 * export const getServerSideProps = withLanguageDetection(
 *   '/products',
 *   async (context, languageResult) => {
 *     // Access detected language and country
 *     const { detectedLanguage, detectedCountry } = languageResult;
 *
 *     // Fetch data based on detected region
 *     const products = await getProductsByRegion(detectedCountry);
 *     const categories = await getCategoriesByLanguage(context.locale);
 *
 *     return { products, categories };
 *   }
 * );
 */
// eslint-disable-next-line react-func/max-lines-per-function
export const withLanguageDetection = <T extends Record<string, any> = Record<string, any>>(
  pagePath: string,
  getPropsFunction?: (
    context: GetServerSidePropsContext,
    languageResult: LanguageDetectionResult,
  ) => Promise<T> | T,
) => {
  return async (
    context: GetServerSidePropsContext,
  ): Promise<
    GetServerSidePropsResult<
      T & Partial<{ countryLanguagePreference: CountryLanguagePreferenceResponse }>
    >
  > => {
    return logTransaction('withLanguageDetection', 'LanguageDetection', async () => {
      try {
        const languageResult = await performLanguageDetection(context, pagePath);

        // If redirect is needed, return redirect response
        if (languageResult.shouldRedirect && languageResult.redirectDestination) {
          logInfo('Performing language redirect', {
            destination: languageResult.redirectDestination,
          });
          return {
            redirect: {
              destination: languageResult.redirectDestination,
              permanent: false, // Use temporary redirect since language preference might change
            },
          };
        }

        // Get additional props if function provided
        if (getPropsFunction) {
          const result = await getPropsFunction(context, languageResult);

          // If the function returns notFound, preserve it
          if (typeof result === 'object' && result !== null && 'notFound' in result) {
            return result as unknown as GetServerSidePropsResult<T>;
          }

          return {
            props: {
              ...result,
              ...(languageResult?.countryLanguagePreference && {
                countryLanguagePreference: languageResult.countryLanguagePreference,
              }),
            },
          };
        }

        return {
          props: {
            ...(languageResult?.countryLanguagePreference && {
              countryLanguagePreference: languageResult.countryLanguagePreference,
            }),
          } as unknown as T,
        };
      } catch (error) {
        // Log to both New Relic and Sentry
        logError('Language detection failed', error as Error, {
          pagePath,
          context: 'withLanguageDetection',
        });
        logErrorToSentry(error, {
          metadata: { context: 'withLanguageDetection', pagePath },
          transactionName: 'withLanguageDetection',
        });

        // Return default props on error
        return {
          props: {} as T,
        };
      }
    });
  };
};
