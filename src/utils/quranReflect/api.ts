/* eslint-disable import/prefer-default-export */
/* eslint-disable @typescript-eslint/naming-convention */
import stringify from '@/utils/qs-stringify';

export const makeQuranReflectApiUrl = (path: string, parameters = {}): string => {
  const params = {
    client_auth_token: process.env.NEXT_PUBLIC_QURAN_REFLECT_TOKEN,
    ...parameters,
  };
  return `https://quranreflect.com/${path}?${stringify(params)}`;
};
