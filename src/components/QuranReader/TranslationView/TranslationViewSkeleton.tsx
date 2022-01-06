import styles from './TranslationView.module.scss';
import TranslationViewCellSkeleton from './TranslatioViewCellSkeleton';

const TranslationViewSkeleton = () => {
  return (
    <div className={styles.container}>
      <TranslationViewCellSkeleton />
      <TranslationViewCellSkeleton />
      <TranslationViewCellSkeleton />
      <TranslationViewCellSkeleton />
      <TranslationViewCellSkeleton />
    </div>
  );
};

export default TranslationViewSkeleton;
