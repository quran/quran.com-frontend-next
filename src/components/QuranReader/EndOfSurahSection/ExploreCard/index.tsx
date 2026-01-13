import React, { useMemo, useCallback } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import { ACTION_BUTTONS, ActionButton } from './actions';
import styles from './ExploreCard.module.scss';

import Card from '@/components/HomePage/Card';
import { ModalType } from '@/components/QuranReader/TranslationView/BottomActionsModals';
import Button, { ButtonShape, ButtonSize, ButtonType, ButtonVariant } from '@/dls/Button/Button';
import Link from '@/dls/Link/Link';
import BookmarkRemoveIcon from '@/icons/bookmark_remove.svg';
import LightbulbOnIcon from '@/icons/lightbulb-on.svg';
import { selectSelectedTafsirs } from '@/redux/slices/QuranReader/tafsirs';
import { pickRandom } from '@/utils/array';
import { logButtonClick } from '@/utils/eventLogger';
import { fakeNavigate, getProfileNavigationUrl } from '@/utils/navigation';
import { ChapterContent } from 'types/ApiResponses';

interface ExploreCardProps {
  cardClassName?: string;
  chapterNumber: number;
  verseKey: string;
  questionsVerseKey: string;
  suggestions?: ChapterContent[];
  hasQuestions: boolean;
  hasClarificationQuestion: boolean;
  onModalOpen: (modalType: ModalType) => void;
}

// Action helpers are defined in ./actions

const ExploreCard: React.FC<ExploreCardProps> = ({
  cardClassName,
  chapterNumber,
  verseKey,
  questionsVerseKey,
  suggestions,
  hasQuestions,
  hasClarificationQuestion,
  onModalOpen,
}) => {
  const { t, lang } = useTranslation();
  const selectedTafsirs = useSelector(selectSelectedTafsirs);
  const randomSuggestion = useMemo(() => pickRandom(suggestions), [suggestions]);

  const handleMyQuranClick = () => {
    logButtonClick('end_of_surah_my_quran');
  };

  const getButtonLabel = (button: ActionButton): string => {
    const namespace = button.namespace ?? 'quran-reader';
    return t(`${namespace}:${button.key}`);
  };

  const handleButtonClick = useCallback(
    (button: ActionButton) => {
      onModalOpen(button.modalType);
      const normalizedKey = button.key.replace(/\./g, '_');
      logButtonClick(`end_of_surah_${normalizedKey}`, { chapterNumber });

      // Use questionsVerseKey for Answers button, verseKey for others
      const navigationVerseKey =
        button.modalType === ModalType.QUESTIONS ? questionsVerseKey : verseKey;

      fakeNavigate(
        button.getNavigationUrl({
          chapterNumber,
          verseKey: navigationVerseKey,
          selectedTafsirs,
        }),
        lang,
      );
    },
    [onModalOpen, chapterNumber, verseKey, questionsVerseKey, selectedTafsirs, lang],
  );

  return (
    <Card className={classNames(styles.endOfSurahCard, cardClassName)} data-testid="explore-card">
      <div className={styles.header}>
        <span className={styles.title}>{t('quran-reader:end-of-surah.explore')}</span>
        <Link
          href={getProfileNavigationUrl()}
          className={styles.myQuranContainer}
          onClick={handleMyQuranClick}
          aria-label={t('quran-reader:end-of-surah.my-quran')}
        >
          <BookmarkRemoveIcon />
          <span className={styles.myQuranLink}>{t('quran-reader:end-of-surah.my-quran')}</span>
        </Link>
      </div>

      <div className={styles.content}>
        <div className={styles.buttonsRow}>
          {ACTION_BUTTONS.map((button) => {
            // Skip Answers button if no questions available
            if (button.modalType === ModalType.QUESTIONS && !hasQuestions) {
              return null;
            }

            const Icon = button.icon;
            const label = getButtonLabel(button);

            // For Answers button, use a special icon when there is a clarification question
            const iconElement =
              button.modalType === ModalType.QUESTIONS && hasClarificationQuestion ? (
                <LightbulbOnIcon />
              ) : (
                <Icon />
              );

            return (
              <Button
                key={button.key}
                type={ButtonType.Primary}
                size={ButtonSize.Small}
                variant={ButtonVariant.Compact}
                shape={ButtonShape.Pill}
                onClick={() => handleButtonClick(button)}
                prefix={iconElement}
                className={styles.button}
                aria-label={label}
              >
                {label}
              </Button>
            );
          })}
        </div>

        {randomSuggestion && (
          <div className={styles.suggestionSection} data-testid="suggestions">
            <div className={styles.suggestionLabel}>
              {t('quran-reader:end-of-surah.suggestions')}
            </div>
            <div className={styles.suggestionText}>{randomSuggestion.text}</div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ExploreCard;
