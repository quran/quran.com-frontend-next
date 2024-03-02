import { useMemo, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { Virtuoso } from 'react-virtuoso';

import ReflectionsTabIntroduction from './ReflectionsTabIntroduction';
import styles from './UserPublicReflectionsList.module.scss';
import UserPublicReflectionsListItem from './UserPublicReflectionsListItem';

import ReflectionModal from '@/components/QuranReflect/ReflectionModal';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import GetUserReflectionsResponse from '@/types/auth/GetUserReflectionsResponse';
import AyahReflection from '@/types/QuranReflect/AyahReflection';

interface UserPublicReflectionsListProps {
  data: GetUserReflectionsResponse[];
  isValidating: boolean;
  size: number;
  setSize: (size: number) => void;
}

const UserPublicReflectionsList = ({
  data,
  isValidating,
  size,
  setSize,
}: UserPublicReflectionsListProps) => {
  const { t } = useTranslation('notes');
  const [selectedReflection, setSelectedReflection] = useState<AyahReflection | null>(null); // for the note modal

  const lastPageData = data[data.length - 1];
  const { hasNextPage } = lastPageData.pagination;

  const reflections = useMemo(() => {
    return data ? data.map((response) => response.data).flat() : [];
  }, [data]);

  const isLoading = !data && isValidating;
  const isLoadingMoreData = reflections?.length > 0 && size > 1 && isValidating;
  const isEmpty = !isLoading && reflections.length === 0;

  const loadMore = () => {
    if (!hasNextPage || isValidating) return;
    setSize(size + 1);
  };

  const renderReflection = (index: number, reflection: (typeof reflections)[number]) => {
    return (
      <UserPublicReflectionsListItem
        key={reflection.id}
        reflection={reflection}
        setSelectedReflection={setSelectedReflection}
      />
    );
  };

  let content = null;
  if (isLoadingMoreData || isLoading) {
    content = <Spinner size={SpinnerSize.Large} />;
  } else if (isEmpty) {
    content = (
      <div className={styles.emptyNotesContainer}>
        <span>{t('empty-reflections')}</span>
      </div>
    );
  }

  return (
    <>
      {selectedReflection && (
        <ReflectionModal
          isOpen
          onClose={() => setSelectedReflection(null)}
          reflection={selectedReflection}
        />
      )}

      <ReflectionsTabIntroduction />
      <Virtuoso
        data={reflections}
        overscan={10}
        increaseViewportBy={{ top: 10, bottom: 10 }}
        className={styles.notesListContainer}
        endReached={loadMore}
        itemContent={renderReflection}
        useWindowScroll
      />

      {content}
    </>
  );
};

export default UserPublicReflectionsList;
