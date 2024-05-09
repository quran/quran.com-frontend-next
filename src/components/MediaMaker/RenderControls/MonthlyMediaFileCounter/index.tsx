import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import useGetMediaFilesCount from '@/hooks/auth/media/useGetMediaFilesCount';
import { MediaType } from '@/types/Media/GenerateMediaFileRequest';

type Props = {
  type: MediaType;
};

const MonthlyMediaFileCounter: React.FC<Props> = ({ type }) => {
  const { t } = useTranslation('quran-media-maker');
  const { data } = useGetMediaFilesCount(type);
  if (data?.data) {
    if (type === MediaType.VIDEO) {
      return (
        <>
          {t('video-limit', {
            count: data?.data?.count,
            limit: data?.data?.limit,
          })}
        </>
      );
    }
    return (
      <>
        {t('image-limit', {
          count: data?.data?.count,
          limit: data?.data?.limit,
        })}
      </>
    );
  }
  return <></>;
};

export default MonthlyMediaFileCounter;
