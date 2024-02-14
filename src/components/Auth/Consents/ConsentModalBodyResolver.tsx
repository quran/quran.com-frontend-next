import { useState } from 'react';

import dynamic from 'next/dynamic';
import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import ConsentType from '@/types/auth/ConsentType';
import { updateUserConsent } from '@/utils/auth/api';
import { makeUserProfileUrl } from '@/utils/auth/apiPaths';
import UserProfile from 'types/auth/UserProfile';

const ConsentModal = dynamic(() => import('@/components/Auth/Consents/ConsentModal'));

type Props = {
  missingConsents: ConsentType[];
};

const ConsentModalBodyResolver = ({ missingConsents }: Props) => {
  const { mutate } = useSWRConfig();
  const { t } = useTranslation('common');
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const onCompleted = async (consentType: ConsentType, consented: boolean) => {
    setIsLoading(true);
    updateUserConsent({
      consentType,
      consented,
    })
      .then(() => {
        mutate(
          makeUserProfileUrl(),
          (currentProfileData: UserProfile) => {
            return {
              ...currentProfileData,
              consents: { ...currentProfileData.consents, [consentType]: consented },
            };
          },
          {
            revalidate: false,
          },
        );
      })
      .catch(() => {
        toast(t('common:error.general'), {
          status: ToastStatus.Error,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <ConsentModal
      isLoading={isLoading}
      consentType={missingConsents[0]}
      onCompleted={onCompleted}
    />
  );
};

export default ConsentModalBodyResolver;
