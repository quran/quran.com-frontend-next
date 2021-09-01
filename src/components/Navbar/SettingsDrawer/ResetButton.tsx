import { useDispatch } from 'react-redux';
import resetSettings from 'src/redux/slices/reset-settings';
import Button from 'src/components/dls/Button/Button';
import styles from './ResetButton.module.scss';

// reset button will dispatch a `reset` action
// reducers will listen to this action
// for example, check slices/theme.ts. it has extra reducer that listens to `reset` action
const ResetButton = () => {
  const dispatch = useDispatch();
  return (
    <div className={styles.resetButtonContainer}>
      <Button onClick={() => dispatch(resetSettings())}>Reset Settings</Button>
    </div>
  );
};

export default ResetButton;
