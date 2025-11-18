import React, { useContext, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import useSWRImmutable from 'swr/immutable';

import ReflectionSharePopoverMenu from './ReflectionSharePopoverMenu';
import styles from './SocialInteraction.module.scss';

import { getRangeVerses } from '@/api';
import DataContext from '@/contexts/DataContext';
import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import ChatIcon from '@/icons/chat.svg';
import LoveIcon from '@/icons/love.svg';
import Language from '@/types/Language';
import Reference from '@/types/QuranReflect/Reference';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import { localeToTranslationID } from '@/utils/quranReflect/locale';
import { getQuranReflectPostUrl } from '@/utils/quranReflect/navigation';

type Props = {
  likesCount: number;
  commentsCount: number;
  postId: number;
  reflectionText: string;
  references: Reference[];
};

const referenceRequiresApiCall = (reference: Reference) => {
  return reference.from && reference.to && reference.chapterId;
};

const fetchTrimmedCitationTexts = async (references: Reference[], currentLocale = Language.EN) => {
  const translationId = localeToTranslationID(currentLocale);
  const promises = references.map(async (reference, index) => {
    if (referenceRequiresApiCall(reference)) {
      const fromVerse = `${reference.chapterId}:${reference.from}`;
      const toVerse = `${reference.chapterId}:${reference.to}`;
      const response = await getRangeVerses(currentLocale, {
        from: fromVerse,
        to: toVerse,
        translations: translationId,
        perPage: 'all',
        words: false,
      });
      return { index, verses: response?.verses };
    }
    return { index, verses: [] };
  });

  const results = await Promise.all(promises);
  const citationTexts: Record<number, any[]> = {};

  results.forEach(({ index, verses }) => {
    citationTexts[index] = verses;
  });

  return citationTexts;
};

const SocialInteraction: React.FC<Props> = ({
  likesCount,
  commentsCount,
  postId,
  reflectionText,
  references,
}) => {
  const chaptersData = useContext(DataContext);

  const { lang } = useTranslation();
  const [shouldFetchVerses, setShouldFetchVerses] = useState(false);

  // Check if any references need API calls (have from, to, and chapterId)
  const needsApiCall = references.some((reference) => referenceRequiresApiCall(reference));

  // Only fetch when we need to and when popover is opened
  const { data: versesData, isValidating } = useSWRImmutable(
    shouldFetchVerses && needsApiCall ? ['verses', references] : null,
    () => fetchTrimmedCitationTexts(references, lang as Language),
  );

  // We now handle the verses API shape directly in getCopyReflectionContent

  const onLikesCountClicked = () => {
    logButtonClick('reflection_item_likes');
  };

  const onCommentsCountClicked = () => {
    logButtonClick('reflection_item_comments');
  };

  const onShareMenuOpen = () => {
    // Trigger data fetching when popover opens
    if (needsApiCall && !shouldFetchVerses) {
      setShouldFetchVerses(true);
    }
  };

  const isFetching = needsApiCall && isValidating;

  return (
    <div className={styles.socialInteractionContainer}>
      <Button
        className={styles.actionItemContainer}
        variant={ButtonVariant.Compact}
        href={getQuranReflectPostUrl(postId)}
        isNewTab
        prefix={<LoveIcon />}
        size={ButtonSize.Small}
        onClick={onLikesCountClicked}
        shouldFlipOnRTL={false}
      >
        {toLocalizedNumber(likesCount, lang)}
      </Button>
      <Button
        className={styles.actionItemContainer}
        variant={ButtonVariant.Compact}
        prefix={<ChatIcon />}
        href={getQuranReflectPostUrl(postId, true)}
        isNewTab
        size={ButtonSize.Small}
        onClick={onCommentsCountClicked}
        shouldFlipOnRTL={false}
      >
        {toLocalizedNumber(commentsCount, lang)}
      </Button>

      <ReflectionSharePopoverMenu
        postId={postId}
        reflectionText={reflectionText}
        references={references}
        isFetching={isFetching}
        versesData={versesData}
        chaptersData={chaptersData}
        onShareMenuOpen={onShareMenuOpen}
      />
    </div>
  );
};

export default SocialInteraction;
