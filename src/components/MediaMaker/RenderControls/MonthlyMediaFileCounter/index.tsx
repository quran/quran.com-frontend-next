import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import { MediaType } from '@/types/Media/GenerateMediaFileRequest';

type Props = {
  type: MediaType;
  data?: { count: number; limit: number };
};

const MonthlyMediaFileCounter: React.FC<Props> = ({ type, data }) => {
  const { t } = useTranslation('quran-media-maker');

  if (data) {
    if (type === MediaType.VIDEO) {
      return (
        <>
          {t('video-limit', {
            count: data?.count,
            limit: data?.limit,
          })}
        </>
      );
    }
    return (
      <>
        {t('image-limit', {
          count: data?.count,
          limit: data?.limit,
        })}
      </>
    );
  }
  return <></>;
};

export default MonthlyMediaFileCounter;
