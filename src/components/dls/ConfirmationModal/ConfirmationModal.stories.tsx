/* eslint-disable no-alert */
import Button from '../Button/Button';

import ConfirmationModal from './ConfirmationModal';
import { useConfirm } from './hooks';

export default {
  title: 'dls/ConfirmationModal',
  component: ConfirmationModal,
};

export const Example = () => {
  const confirm = useConfirm();
  const onClick = async () => {
    const isConfirmed = await confirm({
      title: 'are you sure?',
      subtitle: 'really?',
      description: 'seriously are you sure?',
      confirmText: 'yes',
      cancelText: 'no',
    });

    if (isConfirmed) {
      alert('user is really sure');
    } else {
      alert('user is not sure');
    }
  };
  return (
    <>
      <Button onClick={onClick}>test</Button>
      <ConfirmationModal />
    </>
  );
};
