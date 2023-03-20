import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './OptionButton.module.scss';

import MoonIllustrationSVG from '@/public/images/moon-illustration.svg';

interface OptionButtonProps {
  option: string;
  description?: string;
  selected?: boolean;
  recommended?: boolean;
  icon?: React.ReactNode;
  onSelect: () => void;
}

const OptionButton: React.FC<OptionButtonProps> = ({
  option,
  description,
  selected,
  recommended,
  icon: Icon = MoonIllustrationSVG,
  onSelect,
}) => {
  const { t } = useTranslation('reading-goal');

  return (
    <button
      type="button"
      onClick={onSelect}
      className={classNames(styles.button, selected && styles.selected)}
    >
      <Icon className={styles.icon} />
      {recommended && <span className={styles.recommended}>{t('recommended')}</span>}
      <div className={styles.textContainer}>
        <p className={styles.title}>{option}</p>
        {description && <p className={styles.description}>{description}</p>}
      </div>
    </button>
  );
};

export default OptionButton;
