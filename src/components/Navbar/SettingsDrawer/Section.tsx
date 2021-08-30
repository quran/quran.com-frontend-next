import classNames from 'classnames';
import styles from './Section.module.scss';

export const Section = ({ children }) => <h2 className={styles.section}>{children}</h2>;
export const SectionTitle = ({ children }) => <div className={styles.title}>{children}</div>;
export const SectionLabel = ({ children }) => <div className={styles.label}>{children}</div>;
export const SectionDescription = ({ children, visible = true }) => (
  <div
    className={classNames(styles.description, {
      [styles.invisible]: !visible,
    })}
  >
    {children}
  </div>
);
export const SectionRow = ({ children }) => <div className={styles.row}>{children}</div>;
