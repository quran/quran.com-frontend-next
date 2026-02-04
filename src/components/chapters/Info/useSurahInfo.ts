import { useState, useMemo, useCallback, useEffect } from 'react';

import { useRouter } from 'next/router';
import { useSWRConfig } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { getChapterInfo } from '@/api';
import { ChapterInfoResponse } from '@/types/ApiResponses';
import Language from '@/types/Language';
import { makeChapterInfoUrl } from '@/utils/apiPaths';
import { fakeNavigate, getSurahInfoNavigationUrl } from '@/utils/navigation';

interface UseSurahInfoParams {
  chapterId: string;
  initialResourceId?: string | null;
}

interface UseSurahInfoResult {
  chapterInfo?: ChapterInfoResponse['chapterInfo'];
  resources?: ChapterInfoResponse['resources'];
  storedResources: ChapterInfoResponse['resources'];
  selectedResourceId: string | null;
  error: unknown;
  isLoadingOrValidating: boolean;
  isError: boolean;
  isValidating: boolean;
  isEmpty: boolean;
  mutate: () => void;
  handleResourceChange: (resourceId: string) => void;
}

const useSurahInfo = ({ chapterId, initialResourceId }: UseSurahInfoParams): UseSurahInfoResult => {
  const router = useRouter();
  const { mutate: globalMutate } = useSWRConfig();
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(initialResourceId);
  const [storedResources, setStoredResources] = useState<ChapterInfoResponse['resources']>(null);

  const apiParams = useMemo(
    () => ({
      includeResources: true,
      ...(selectedResourceId && { resourceId: selectedResourceId }),
    }),
    [selectedResourceId],
  );

  const {
    data: chapterInfoData,
    error,
    isValidating,
    mutate,
  } = useSWRImmutable<ChapterInfoResponse>(
    makeChapterInfoUrl(chapterId, router.locale || Language.EN, apiParams),
    () => getChapterInfo(chapterId, router.locale || Language.EN, apiParams),
  );

  const chapterInfo = chapterInfoData?.chapterInfo;
  const resources = chapterInfoData?.resources;

  useEffect(() => {
    setStoredResources(null);
  }, [chapterId, router.locale]);

  useEffect(() => {
    if (resources && resources.length > 0) setStoredResources(resources);
  }, [resources]);

  useEffect(() => {
    if (
      chapterInfoData &&
      chapterInfoData.chapterInfo &&
      chapterInfoData.chapterInfo.resourceId &&
      !selectedResourceId
    ) {
      const resourceSpecificUrl = makeChapterInfoUrl(chapterId, router.locale || Language.EN, {
        includeResources: true,
        resourceId: String(chapterInfoData.chapterInfo.resourceId),
      });

      globalMutate(resourceSpecificUrl, chapterInfoData);
    }
  }, [chapterInfoData, selectedResourceId, chapterId, router.locale, globalMutate]);

  const handleResourceChange = useCallback(
    (resourceId: string) => {
      setSelectedResourceId(resourceId);
      const newUrl = getSurahInfoNavigationUrl(chapterId, resourceId);
      fakeNavigate(newUrl, router.locale || Language.EN);
    },
    [chapterId, router.locale],
  );

  const isLoadingOrValidating = isValidating || (!chapterInfoData && !error);
  const isError = !isLoadingOrValidating && error;
  const isEmpty = !isLoadingOrValidating && !isError && !chapterInfo;

  return {
    chapterInfo,
    resources,
    storedResources,
    selectedResourceId,
    error,
    isLoadingOrValidating,
    isError,
    isEmpty,
    isValidating,
    mutate,
    handleResourceChange,
  };
};

export default useSurahInfo;
