import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import { LanguageDetectionResult } from './serverSideLanguageDetection';

import Chapter from '@/types/Chapter';
import { AppStore } from 'src/redux/store';

export type GetSsrPropsWithReduxContext = GetServerSidePropsContext & {
  store: AppStore;
  chaptersData?: Record<string, Chapter>;
};

// Base shape automatically enriched by withSsrRedux.
// chaptersData: list or map of chapters loaded according to detected language.
// chaptersDataFailed?: marks a silent failure fallback.
export interface WithSsrReduxBaseProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chaptersData?: any;
  chaptersDataFailed?: boolean;
}

export type GetSsrPropsWithRedux<P extends { [key: string]: any } = { [key: string]: any }> = (
  context: GetSsrPropsWithReduxContext,
  languageResult: LanguageDetectionResult,
  // Resulting props will be merged with WithSsrReduxBaseProps by the HOC.
) =>
  | GetServerSidePropsResult<P & WithSsrReduxBaseProps>
  | Promise<GetServerSidePropsResult<P & WithSsrReduxBaseProps>>;
