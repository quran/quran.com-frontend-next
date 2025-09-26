import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './OptionButton.module.scss';

import MoonIllustrationSVG from '@/public/images/moon-illustration.svg';

interface OptionButtonProps {
  option: string;
  description?: string;
  isSelected?: boolean;
  isRecommended?: boolean;
  icon?: React.ReactNode;
  onSelect: () => void;
}

const OptionButton: React.FC<OptionButtonProps> = ({
  option,
  description,
  isSelected,
  isRecommended,
  icon: Icon = MoonIllustrationSVG,
  onSelect,
}) => {
  const { t } = useTranslation('reading-goal');

  return (
    <button
      type="button"
      onClick={onSelect}
      className={classNames(styles.button, isSelected && styles.selected)}
    >
      <Icon className={styles.icon} />
      {isRecommended && <span className={styles.recommended}>{t('recommended')}</span>}
      <div className={styles.textContainer}>
        <p className={styles.title}>{option}</p>
        {description && <p className={styles.description}>{description}</p>}
      </div>
    </button>
  );
};

export default OptionButton;
