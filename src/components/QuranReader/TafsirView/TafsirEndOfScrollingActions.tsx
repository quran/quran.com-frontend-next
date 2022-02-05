import useTranslation from 'next-translate/useTranslation';

import styles from './TafsirEndOfScrollingActions.module.scss';

import Button, { ButtonType } from 'src/components/dls/Button/Button';

type TafsirEndOfScrollingActionsProps = {
  hasNextVerseGroup: boolean;
  hasPrevVersegroup: boolean;
  onNextButtonClicked: () => void;
  onPreviousButtonClicked: () => void;
};

const TafsirEndOfScrollingActions = ({
  hasNextVerseGroup,
  hasPrevVersegroup,
  onNextButtonClicked,
  onPreviousButtonClicked,
}: TafsirEndOfScrollingActionsProps) => {
  const { t } = useTranslation('common');
  return (
    <div className={styles.container}>
      <div>
        {hasPrevVersegroup && (
          <Button type={ButtonType.Secondary} onClick={onPreviousButtonClicked}>
            {t('prev')}
          </Button>
        )}
      </div>
      <div>
        {hasNextVerseGroup && (
          <Button type={ButtonType.Secondary} onClick={onNextButtonClicked}>
            {t('next')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default TafsirEndOfScrollingActions;
