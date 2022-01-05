import useTranslation from 'next-translate/useTranslation';

import styles from './TafsirEndOfScrollingActions.module.scss';

import Button, { ButtonType } from 'src/components/dls/Button/Button';
import { isFirstVerseOfSurah, isLastVerseOfSurah } from 'src/utils/verse';

type TafsirEndOfScrollingActionsProps = {
  currentVerseNumber: string;
  currentChapterId: string;
  onNextButtonClicked: () => void;
  onPreviousButtonClicked: () => void;
};

const TafsirEndOfScrollingActions = ({
  currentVerseNumber,
  currentChapterId,
  onNextButtonClicked,
  onPreviousButtonClicked,
}: TafsirEndOfScrollingActionsProps) => {
  const { t } = useTranslation('common');
  return (
    <div className={styles.container}>
      <div>
        {!isFirstVerseOfSurah(Number(currentVerseNumber)) && (
          <Button type={ButtonType.Secondary} onClick={onPreviousButtonClicked}>
            {t('prev')}
          </Button>
        )}
      </div>
      <div>
        {!isLastVerseOfSurah(currentChapterId, Number(currentVerseNumber)) && (
          <Button type={ButtonType.Secondary} onClick={onNextButtonClicked}>
            {t('next')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default TafsirEndOfScrollingActions;
