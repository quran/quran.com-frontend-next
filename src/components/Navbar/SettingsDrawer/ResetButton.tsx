import { useDispatch } from 'react-redux';
import reset from 'src/redux/slices/reset';
import Button from 'src/components/dls/Button/Button';

// reset button will dispatch a `reset` action
// reducers will listen to this action
// for example, check slices/theme.ts. it has extra reducer that listens to `reset` action
const ResetButton = () => {
  const dispatch = useDispatch();
  return <Button onClick={() => dispatch(reset())}>Reset settings</Button>;
};

export default ResetButton;
