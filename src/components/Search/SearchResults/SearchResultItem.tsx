/* eslint-disable react/no-danger */

import React, { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import ThumbsDownIcon from '../../../../public/icons/thumbsdown-outline.svg';
import ThumbsUpIcon from '../../../../public/icons/thumbsup-outline.svg';

import styles from './SearchResultItem.module.scss';

import Link from '@/dls/Link/Link';
import { getChapterData } from '@/utils/chapter';
import { toLocalizedVerseKey } from '@/utils/locale';
import { getChapterNumberFromKey } from '@/utils/verse';
import { submitKalimatSearchResultFeedback } from 'src/api';
import Button, { ButtonVariant } from 'src/components/dls/Button/Button';
import QuranWord from 'src/components/dls/QuranWord/QuranWord';
import { ToastStatus, useToast } from 'src/components/dls/Toast/Toast';
import useGetChaptersData from 'src/hooks/useGetChaptersData';
import { logButtonClick } from 'src/utils/eventLogger';
import { getChapterWithStartingVerseUrl } from 'src/utils/navigation';
import Verse from 'types/Verse';
import { CharType } from 'types/Word';

export enum Source {
  SearchDrawer = 'search_drawer',
  SearchPage = 'search_page',
  Tarteel = 'tarteel',
}

interface Props {
  result: Verse;
  source: Source;
  showFeedbackButtons?: boolean;
  searchQuery?: string;
}

const SearchResultItem: React.FC<Props> = ({
  result,
  source,
  searchQuery,
  showFeedbackButtons,
}) => {
  const toast = useToast();
  const { t, lang } = useTranslation('quran-reader');
  const localizedVerseKey = useMemo(
    () => toLocalizedVerseKey(result.verseKey, lang),
    [lang, result.verseKey],
  );

  const chaptersData = useGetChaptersData(lang);

  if (!chaptersData) return null;

  const chapterNumber = getChapterNumberFromKey(result.verseKey);
  const chapterData = getChapterData(chaptersData, chapterNumber.toString());

  const onFeedbackIconClicked = (isThumbsUp: boolean) => {
    const feedbackRequestParams = {
      query: searchQuery,
      feedbackScore: isThumbsUp ? 1 : -1,
      result: result.verseKey,
    };
    submitKalimatSearchResultFeedback(feedbackRequestParams)
      .then(() => {
        toast('Feedback submitted successfully!', {
          status: ToastStatus.Success,
        });
      })
      .catch(() => {
        toast(t('common:error.general'), {
          status: ToastStatus.Error,
        });
      });
  };

  return (
    <div className={styles.container}>
      <div className={styles.itemContainer}>
        <Link
          href={getChapterWithStartingVerseUrl(result.verseKey)}
          shouldPassHref
          onClick={() => {
            logButtonClick(`${source}_result_item`);
          }}
        >
          <a className={styles.verseKey}>
            {chapterData.transliteratedName} {localizedVerseKey}
          </a>
        </Link>
        <div className={styles.quranTextContainer}>
          <div className={styles.quranTextResult} translate="no">
            {/* @ts-ignore */}
            {result.qpcUthmaniHafs.split(' ').map((wordText, index) => {
              return (
                <QuranWord
                  isHighlighted={false}
                  key={`${result.verseKey}:${index + 1}`}
                  // @ts-ignore
                  word={{
                    ...result,
                    id: index,
                    charTypeName: CharType.Word,
                    hizbNumber: result.hizbNumber,
                    text: wordText,
                  }}
                  isWordByWordAllowed={false}
                  isAudioHighlightingAllowed={false}
                />
              );
            })}
          </div>
        </div>
        {result.translations?.map((translation) => (
          <div key={translation.resourceId} className={styles.translationContainer}>
            <div dangerouslySetInnerHTML={{ __html: translation.text }} />
            {/* eslint-disable-next-line i18next/no-literal-string */}
            <p className={styles.translationName}> - {translation.resourceName}</p>
          </div>
        ))}
        {showFeedbackButtons && (
          <div className={styles.iconsContainer}>
            <Button
              variant={ButtonVariant.Ghost}
              onClick={() => {
                onFeedbackIconClicked(true);
              }}
            >
              <ThumbsUpIcon />
            </Button>
            <Button
              variant={ButtonVariant.Ghost}
              onClick={() => {
                onFeedbackIconClicked(false);
              }}
            >
              <ThumbsDownIcon />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
export default SearchResultItem;
