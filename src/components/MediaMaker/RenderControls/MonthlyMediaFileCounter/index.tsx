import React from 'react';

import useGetMediaFilesCount from '@/hooks/auth/media/useGetMediaFilesCount';
import { MediaType } from '@/types/Media/GenerateMediaFileRequest';

type Props = {
  type: MediaType;
};

const MonthlyMediaFileCounter: React.FC<Props> = ({ type }) => {
  const { data } = useGetMediaFilesCount(type);
  return <>{data?.data && <>{`${data?.data?.count}/${data?.data?.limit}`}</>}</>;
};

export default MonthlyMediaFileCounter;
