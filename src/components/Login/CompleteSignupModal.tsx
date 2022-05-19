import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';

import styles from './CompleteSignupModal.module.scss';

import { privateFetcher } from 'src/api';
import Button from 'src/components/dls/Button/Button';
import Input from 'src/components/dls/Forms/Input';
import Modal from 'src/components/dls/Modal/Modal';
import { getAuthApiPath } from 'src/utils/url';

type CompleteSignupModalProps = {
  isOpen: boolean;
};

const CompleteSignupModal = ({ isOpen }: CompleteSignupModalProps) => {
  const { t } = useTranslation('profile');
  const [name, setName] = useState('');

  const router = useRouter();

  const onSubmitClicked = (e) => {
    e.preventDefault();
    privateFetcher(`${getAuthApiPath('users/completeSignup')}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
      }),
    }).then(() => {
      router.reload();
    });
  };

  return (
    <Modal isOpen={isOpen}>
      <form className={styles.container}>
        <h2 className={styles.title}>{t('complete-sign-up')}</h2>
        <Input
          id="user-name"
          containerClassName={styles.input}
          fixedWidth={false}
          placeholder={t('your-name')}
          onChange={setName}
          isRequired
        />
        <Button htmlType="submit" onClick={onSubmitClicked}>
          {t('submit')}
        </Button>
      </form>
    </Modal>
  );
};

export default CompleteSignupModal;
