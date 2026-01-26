import classNames from 'classnames';

import colorStyles from './color.module.scss';
import styles from './QiraahCard.module.scss';

export interface QiraahReading {
  id: string;
  arabic: string;
  explanation?: string;
  translation?: string;
  transliteration?: string;
  color: string;
}

interface QiraahCardProps extends QiraahReading {}

/**
 * Display a single reading variant with Arabic text, transliteration,
 * translation, explanation, and reader attribution.
 *
 * @returns {JSX.Element} Rendered QiraahCard component
 */
const QiraahCard: React.FC<QiraahCardProps> = ({
  explanation,
  translation,
  arabic,
  transliteration,
  color,
}) => {
  return (
    <div className={classNames(styles.card, colorStyles[color])}>
      <div className={styles.arabicText} dir="auto">
        {arabic}
      </div>

      {transliteration && <div className={styles.transliteration}>{transliteration}</div>}
      {translation && <div className={styles.translation}>{translation}</div>}
      {explanation && <div className={styles.separator} />}
      {explanation && <div className={styles.explanation}>{explanation}</div>}
    </div>
  );
};

export default QiraahCard;
