/* eslint-disable react-func/max-lines-per-function */
import { ParsedUrlQuery } from 'querystring';

import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import syncUserPreferences from '@/redux/actions/sync-user-preferences';
import { setIsUsingDefaultSettings, setUserHasCustomised } from '@/redux/slices/defaultSettings';
import getStore from '@/redux/store';
import { getQdcPreferencesFromCookieHeader } from '@/utils/qdcPreferencesCookies';
import { performLanguageDetection } from '@/utils/serverSideLanguageDetection';
import { GetSsrPropsWithRedux } from '@/utils/withSsrRedux.types';
import PreferenceGroup from 'types/auth/PreferenceGroup';

export const REDUX_STATE_PROP_NAME = '__REDUX_STATE__';

const withSsrRedux =
  (pagePath: string, getSsrProps?: GetSsrPropsWithRedux) =>
  async (
    context: GetServerSidePropsContext<ParsedUrlQuery>,
  ): Promise<GetServerSidePropsResult<any>> => {
    const languageResult = await performLanguageDetection(context, pagePath);

    if (languageResult.shouldRedirect) {
      return {
        redirect: {
          destination: languageResult.redirectDestination,
          permanent: false,
        },
      };
    }

    const store = getStore(
      languageResult.detectedLanguage,
      languageResult.countryLanguagePreference,
      undefined,
      languageResult.detectedLanguage,
      languageResult.detectedCountry,
    );

    // Apply persisted SSR preferences snapshot (if present) before running page props logic.
    // This allows the initial SSR HTML to reflect the user's Quran Reader preferences without
    // waiting for client-side hydration/fetching.
    let ssrPreferencesApplied = false;
    const { preferences } = getQdcPreferencesFromCookieHeader(context.req.headers.cookie);
    if (preferences) {
      store.dispatch(syncUserPreferences(preferences, languageResult.detectedLanguage));

      const userCustomization = preferences[PreferenceGroup.USER_CUSTOMIZATION];
      const userHasCustomised = Boolean(userCustomization?.userHasCustomised);
      store.dispatch(setUserHasCustomised(userHasCustomised));
      // Conservative: if user has customised, treat as not using defaults to avoid overriding on locale change.
      store.dispatch(setIsUsingDefaultSettings(!userHasCustomised));

      ssrPreferencesApplied = true;
    }

    const result = getSsrProps
      ? await getSsrProps({ ...context, store }, languageResult)
      : { props: {} };

    if ('props' in result) {
      return {
        ...result,
        props: {
          ...result.props,
          ssrPreferencesApplied,
          [REDUX_STATE_PROP_NAME]: store.getState(),
          ...(languageResult.countryLanguagePreference && {
            countryLanguagePreference: languageResult.countryLanguagePreference,
          }),
        },
      };
    }

    return result;
  };

export default withSsrRedux;
