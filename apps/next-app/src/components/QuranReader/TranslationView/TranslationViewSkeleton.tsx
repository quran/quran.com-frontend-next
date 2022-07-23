import range from 'lodash/range';

import styles from './TranslationView.module.scss';
import TranslationViewCellSkeleton from './TranslatioViewCellSkeleton';

interface Props {
  numberOfSkeletons: number;
}

const TranslationViewSkeleton: React.FC<Props> = ({ numberOfSkeletons }) => {
  return (
    <div className={styles.container}>
      {range(0, numberOfSkeletons).map((index) => (
        <TranslationViewCellSkeleton key={index} />
      ))}
    </div>
  );
};

export default TranslationViewSkeleton;
