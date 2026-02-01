import { useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { Virtuoso } from 'react-virtuoso';

import styles from '../NotesAndReflectionsTab.module.scss';

import Error from '@/components/Error';
import CardsSkeleton from '@/components/MyQuran/Skeleton';
import ReflectionCard from '@/components/Notes/modal/MyNotes/Card/ReflectionCard';
import AyahReflection from '@/types/QuranReflect/AyahReflection';
import { logButtonClick } from '@/utils/eventLogger';

// It will be used to calculate approximate min height to prevent block size jumping during virtuoso initial calculations
const PROXIMATE_REFLECTION_HEIGHT = 140;

interface ReflectionsTabContentProps {
  reflections: AyahReflection[];
  isLoading: boolean;
  isValidating: boolean;
  error: unknown;
  loadMore: (index: number) => void;
  mutateCache: () => void;
}

const ReflectionsTabContent: React.FC<ReflectionsTabContentProps> = ({
  reflections,
  isLoading,
  isValidating,
  error,
  loadMore,
  mutateCache,
}) => {
  const { t } = useTranslation('notes');

  const handleRetry = useCallback(() => {
    logButtonClick('reflections_tab_retry');
    mutateCache();
  }, [mutateCache]);

  const renderReflection = useCallback((index: number, reflection: AyahReflection) => {
    return (
      <div className={styles.noteItem}>
        <ReflectionCard key={reflection.id} reflection={reflection} showReadMore />
      </div>
    );
  }, []);

  const isValidatingOrLoading = isValidating || isLoading;
  const isError = !!error && !isValidatingOrLoading;
  const isEmpty = !isError && !isValidatingOrLoading && reflections.length === 0;

  if (isEmpty) {
    return (
      <div className={styles.statusContainer} data-status="empty">
        {t('empty-reflections')}
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

      {isValidatingOrLoading && <CardsSkeleton count={5} />}

      {isError && (
        <div className={styles.statusContainer}>
          <Error error={error as Error} onRetryClicked={handleRetry} />
        </div>
      )}
    </>
  );
};

export default ReflectionsTabContent;
