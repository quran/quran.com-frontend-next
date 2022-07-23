import styles from './shared-web-ui.module.scss';

/* eslint-disable-next-line */
export interface SharedWebUiProps {}

export function SharedWebUi(props: SharedWebUiProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to SharedWebUi!</h1>
    </div>
  );
}

export default SharedWebUi;
