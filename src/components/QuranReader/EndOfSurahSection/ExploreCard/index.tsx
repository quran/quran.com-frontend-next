import React, { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';
import { ChapterContent } from 'types/ApiResponses';

import { ACTION_BUTTONS, ActionButton } from './actions';
import styles from './ExploreCard.module.scss';

import Card from '@/components/HomePage/Card';
import { ModalType } from '@/components/QuranReader/TranslationView/BottomActionsModals';
import Button, { ButtonShape, ButtonSize, ButtonType, ButtonVariant } from '@/dls/Button/Button';
import Link from '@/dls/Link/Link';
import BookmarkRemoveIcon from '@/icons/bookmark_remove.svg';
import { selectSelectedTafsirs } from '@/redux/slices/QuranReader/tafsirs';
import { pickRandom } from '@/utils/array';
import { logButtonClick } from '@/utils/eventLogger';
import { fakeNavigate, getProfileNavigationUrl } from '@/utils/navigation';

interface ExploreCardProps {
  chapterNumber: number;
  verseKey: string;
  suggestions?: ChapterContent[];
  onModalOpen: (modalType: ModalType) => void;
}

// Action helpers are defined in ./actions

const ExploreCard: React.FC<ExploreCardProps> = ({
  chapterNumber,
  verseKey,
  suggestions,
  onModalOpen,
}) => {
  const { t, lang } = useTranslation('quran-reader');
  const { t: tCommon } = useTranslation('common');
  const selectedTafsirs = useSelector(selectSelectedTafsirs);

  const randomSuggestion = useMemo(() => pickRandom(suggestions), [suggestions]);

  const handleMyQuranClick = () => {
    logButtonClick('end_of_surah_my_quran');
  };

  const getButtonLabel = (button: ActionButton): string => {
    return button.namespace === 'common' ? tCommon(button.key) : t(button.key);
  };

  const handleButtonClick = (button: ActionButton) => {
    onModalOpen(button.modalType);
    logButtonClick(`end_of_surah_${button.key}`, { chapterNumber });
    fakeNavigate(
      button.getNavigationUrl({
        chapterNumber,
        verseKey,
        selectedTafsirs,
      }),
      lang,
    );
  };

  return (
    <Card className={styles.endOfSurahCard} data-testid="explore-card">
      <div className={styles.header}>
        <span className={styles.title}>{t('end-of-surah.explore')}</span>
        <Link
          href={getProfileNavigationUrl()}
          className={styles.myQuranContainer}
          onClick={handleMyQuranClick}
          aria-label={t('end-of-surah.my-quran')}
        >
          <BookmarkRemoveIcon />
          <span className={styles.myQuranLink}>{t('end-of-surah.my-quran')}</span>
        </Link>
      </div>

      <div className={styles.content}>
        <div className={styles.buttonsRow}>
          {ACTION_BUTTONS.map((button) => {
            const Icon = button.icon;
            const label = getButtonLabel(button);

            return (
              <Button
                key={button.key}
                type={ButtonType.Primary}
                size={ButtonSize.Small}
                variant={ButtonVariant.Compact}
                shape={ButtonShape.Pill}
                onClick={() => handleButtonClick(button)}
                prefix={<Icon />}
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
            <div className={styles.suggestionLabel}>{t('end-of-surah.suggestions')}</div>
            <div className={styles.suggestionText}>{randomSuggestion.text}</div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ExploreCard;
