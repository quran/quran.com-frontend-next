import { FormEvent, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import styles from './CompleteSignupModal.module.scss';

import Button from 'src/components/dls/Button/Button';
import Input from 'src/components/dls/Forms/Input';
import Modal from 'src/components/dls/Modal/Modal';
import { completeSignup } from 'src/utils/auth/api';
import { makeUserProfileUrl } from 'src/utils/auth/apiPaths';
import CompleteSignupRequest from 'types/CompleteSignupRequest';

type CompleteSignupModalProps = {
  requiredFields: string[];
};

const CompleteSignupModal = ({ requiredFields }: CompleteSignupModalProps) => {
  const { mutate } = useSWRConfig();
  const { t } = useTranslation('common');
  const [data, setData] = useState<CompleteSignupRequest>({});

  const onSubmitClicked = (e) => {
    e.preventDefault();
    completeSignup(data).then(() => {
      // mutate the cache version of users/profile
      mutate(makeUserProfileUrl());
    });
  };

  const isOpen = requiredFields && requiredFields?.length !== 0;
  return (
    <Modal isOpen={isOpen}>
      <form
        className={styles.container}
        onChange={(event: FormEvent<HTMLFormElement>) => {
          const formData = new FormData(event.currentTarget) as unknown as Iterable<
            [CompleteSignupRequest, FormDataEntryValue]
          >;
          setData(Object.fromEntries(formData) as CompleteSignupRequest);
        }}
      >
        <h2 className={styles.title}>{t('complete-sign-up')}</h2>
        {requiredFields?.map((requiredField) => (
          <Input
            key={requiredField}
            id={requiredField}
            name={requiredField}
            containerClassName={styles.input}
            fixedWidth={false}
            placeholder={t(requiredField)}
          />
        ))}
        <Button htmlType="submit" onClick={onSubmitClicked}>
          {t('submit')}
        </Button>
      </form>
    </Modal>
  );
};

export default CompleteSignupModal;
