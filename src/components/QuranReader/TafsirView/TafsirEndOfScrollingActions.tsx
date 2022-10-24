import useTranslation from 'next-translate/useTranslation';

import styles from './TafsirEndOfScrollingActions.module.scss';

import Button, { ButtonType } from '@/dls/Button/Button';

type TafsirEndOfScrollingActionsProps = {
  hasNextVerseGroup: boolean;
  hasPrevVerseGroup: boolean;
  onNextButtonClicked: () => void;
  onPreviousButtonClicked: () => void;
};

const TafsirEndOfScrollingActions = ({
  hasNextVerseGroup,
  hasPrevVerseGroup,
  onNextButtonClicked,
  onPreviousButtonClicked,
}: TafsirEndOfScrollingActionsProps) => {
  const { t } = useTranslation('common');
  return (
    <div className={styles.container}>
      <div>
        {hasPrevVerseGroup && (
          <Button type={ButtonType.Secondary} onClick={onPreviousButtonClicked}>
            {t('previous-ayah')}
          </Button>
        )}
      </div>
      <div>
        {hasNextVerseGroup && (
          <Button type={ButtonType.Secondary} onClick={onNextButtonClicked}>
            {t('next-ayah')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default TafsirEndOfScrollingActions;
