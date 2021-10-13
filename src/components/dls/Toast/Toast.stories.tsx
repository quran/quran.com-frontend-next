/* eslint-disable react/no-multi-comp */
import { ToastContainer, toast } from './Toast';

import Button from 'src/components/dls/Button/Button';

export default {
  title: 'dls/Toast',
};

export const Normal = () => {
  const notify = () => toast('The Evil Rabbit jumped over the fence.');
  return (
    <div>
      <Button onClick={notify}>Notify!</Button>
      <ToastContainer />
    </div>
  );
};

export const Preserve = () => {
  const notify = () => toast('The Evil Rabbit jumped over the fence.', { preserve: true });
  return (
    <div>
      <Button onClick={notify}>Notify!</Button>
      <ToastContainer />
    </div>
  );
};

export const WithCloseButton = () => {
  const notify = () => toast('The Evil Rabbit jumped over the fence.', { withCloseButton: true });
  return (
    <div>
      <Button onClick={notify}>Notify!</Button>
      <ToastContainer />
    </div>
  );
};
