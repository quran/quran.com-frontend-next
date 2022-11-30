import classNames from 'classnames';

import styles from './Spinner.module.scss';

export enum SpinnerSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'Large',
}
type SpinnerProps = {
  size?: SpinnerSize;
  isCentered?: boolean;
  className?: string;
  shouldDelayVisibility?: boolean;
};

const Spinner = ({
  size = SpinnerSize.Medium,
  isCentered = true,
  className,
  shouldDelayVisibility,
}: SpinnerProps) => (
  <div
    className={classNames(styles.spinner, className, {
      [styles.large]: size === SpinnerSize.Large,
      [styles.normal]: size === SpinnerSize.Medium,
      [styles.small]: size === SpinnerSize.Small,
      [styles.centered]: isCentered,
      [styles.delayVisibility]: shouldDelayVisibility,
    })}
  >
    <div className={styles.container}>{getSpans()}</div>
  </div>
);

const getSpans = () =>
  // eslint-disable-next-line @typescript-eslint/naming-convention
  [...new Array(12)].map((_, index) => (
    // eslint-disable-next-line react/no-array-index-key
    <span className={styles.span} key={`spinner-${index}`} />
  ));

export default Spinner;
