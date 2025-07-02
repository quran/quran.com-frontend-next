import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import { LanguageDetectionResult } from './serverSideLanguageDetection';

import { AppStore } from 'src/redux/store';

export type GetSsrPropsWithReduxContext = GetServerSidePropsContext & {
  store: AppStore;
};

export type GetSsrPropsWithRedux<P extends { [key: string]: any } = { [key: string]: any }> = (
  context: GetSsrPropsWithReduxContext,
  languageResult: LanguageDetectionResult,
) => Promise<GetServerSidePropsResult<P>> | GetServerSidePropsResult<P>;
