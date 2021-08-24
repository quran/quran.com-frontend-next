import classNames from 'classnames';
import styles from './Spinner.module.scss';

export enum SpinnerSize {
  Small = 'small',
  Normal = 'normal',
  Large = 'Large',
}
type SpinnerProps = {
  size: SpinnerSize;
};

const Spinner = ({ size }: SpinnerProps) => (
  <svg
    className={classNames(styles.spinner, {
      [styles.large]: size === SpinnerSize.Large,
      [styles.normal]: size === SpinnerSize.Normal,
      [styles.small]: size === SpinnerSize.Small,
    })}
    viewBox="0 0 50 50"
  >
    <circle className={styles.path} cx="25" cy="25" r="20" fill="none" strokeWidth="5" />
  </svg>
);

export default Spinner;
