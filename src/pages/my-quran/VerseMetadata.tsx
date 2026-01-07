import useTranslation from 'next-translate/useTranslation';
import useSWR from 'swr/immutable';

import styles from './VerseMetadata.module.scss';

import Skeleton from '@/dls/Skeleton/Skeleton';
import { TestId } from '@/tests/test-ids';
import { makeByVerseKeyUrl } from '@/utils/apiPaths';
import { toLocalizedNumber } from '@/utils/locale';
import { fetcher } from 'src/api';
import { VerseResponse } from 'types/ApiResponses';

interface VerseMetadataProps {
  verseKey: string;
  mushafId: number;
}

const VerseMetadata = ({ verseKey, mushafId }: VerseMetadataProps) => {
  const { t, lang } = useTranslation('common');

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
    <p data-testid={TestId.MY_QURAN_RECENT_CONTENT_VERSE_METADATA}>
      {t('page')} {toLocalizedNumber(data.verse.pageNumber, lang)}, {t('juz')}{' '}
      {toLocalizedNumber(data.verse.juzNumber, lang)} / {t('hizb')}{' '}
      {toLocalizedNumber(data.verse.hizbNumber, lang)}
    </p>
  );
};

export default VerseMetadata;
