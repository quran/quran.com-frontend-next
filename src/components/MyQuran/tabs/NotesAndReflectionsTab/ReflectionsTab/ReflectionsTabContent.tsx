import { useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { Virtuoso } from 'react-virtuoso';

import styles from '../NotesAndReflectionsTab.module.scss';

import CardsSkeleton from '@/components/MyQuran/Skeleton';
import ReflectionCard from '@/components/Notes/modal/MyNotes/Card/ReflectionCard';
import AyahReflection from '@/types/QuranReflect/AyahReflection';

// It will be used to calculate approximate min height to prevent block size jumping during virtuoso initial calculations
const PROXIMATE_REFLECTION_HEIGHT = 140;

interface ReflectionsTabContentProps {
  reflections: AyahReflection[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: any;
  loadMore: () => void;
}

const ReflectionsTabContent: React.FC<ReflectionsTabContentProps> = ({
  reflections,
  isLoading,
  isLoadingMore,
  error,
  loadMore,
}) => {
  const { t } = useTranslation('notes');

  const renderReflection = useCallback((index: number, reflection: AyahReflection) => {
    return (
      <div className={styles.noteItem}>
        <ReflectionCard key={reflection.id} reflection={reflection} />
      </div>
    );
  }, []);

  if (error) {
    return (
      <div className={styles.statusContainer} data-error="true">
        {t('common:error.general')}
      </div>
    );
  }

  const isEmpty = !isLoading && reflections.length === 0;

  if (isEmpty) {
    return (
      <div className={styles.statusContainer}>
        <div className={styles.emptyState}>
          <p>{t('empty-reflections')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ minBlockSize: reflections.length * PROXIMATE_REFLECTION_HEIGHT }}>
        <Virtuoso
          data={reflections}
          className={styles.virtuosoList}
          overscan={10}
          increaseViewportBy={100}
          endReached={loadMore}
          itemContent={renderReflection}
          useWindowScroll
        />
      </div>

      {(isLoadingMore || isLoading) && <CardsSkeleton count={5} />}
    </>
  );
};

export default ReflectionsTabContent;
