import { ToastContainer, toast } from './Toast';

import Button from 'src/components/dls/Button/Button';

export default {
  title: 'dls/Toast',
};

export const Toast = () => {
  const notify = () => toast('The Evil Rabbit jumped over the fence.');
  return (
    <div>
      <Button onClick={notify}>Notify!</Button>
      <ToastContainer />
    </div>
  );
};
