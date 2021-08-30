import { useDispatch } from 'react-redux';
import reset from 'src/redux/slices/reset';
import Button from 'src/components/dls/Button/Button';

const ResetButton = () => {
  const dispatch = useDispatch();
  return <Button onClick={() => dispatch(reset())}>Reset settings</Button>;
};

export default ResetButton;
