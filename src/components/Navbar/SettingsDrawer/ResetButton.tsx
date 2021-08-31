import { useDispatch } from 'react-redux';
import reset from 'src/redux/slices/reset';
import Button from 'src/components/dls/Button/Button';

// reset button will dispatch a `reset` action
// and reducer that is `reset-able` will listen to this action
// for example, check slice/theme.ts. it has extra reducer that listens to `reset` action
const ResetButton = () => {
  const dispatch = useDispatch();
  return <Button onClick={() => dispatch(reset())}>Reset settings</Button>;
};

export default ResetButton;
