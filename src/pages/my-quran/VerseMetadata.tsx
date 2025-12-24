import useTranslation from 'next-translate/useTranslation';
import useSWR from 'swr/immutable';

import styles from './VerseMetadata.module.scss';

import Skeleton from '@/dls/Skeleton/Skeleton';
import { makeByVerseKeyUrl } from '@/utils/apiPaths';
import { fetcher } from 'src/api';
import { VerseResponse } from 'types/ApiResponses';

interface VerseMetadataProps {
  verseKey: string;
  mushafId: number;
}

const VerseMetadata = ({ verseKey, mushafId }: VerseMetadataProps) => {
  const { t } = useTranslation('common');

  const { data, error } = useSWR<VerseResponse>(
    makeByVerseKeyUrl(verseKey, { mushaf: mushafId }),
    fetcher,
  );

  if (error) {
    return <p>{t('error.verse-metadata-failed')}</p>;
  }

  if (!data || !data.verse) {
    return <Skeleton className={styles.skeleton} />;
  }

  return (
    <p>
      {t('page')} {data.verse.pageNumber}, {t('juz')} {data.verse.juzNumber} / {t('hizb')}{' '}
      {data.verse.hizbNumber}
    </p>
  );
};

export default VerseMetadata;
