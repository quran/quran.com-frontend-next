import classNames from 'classnames';
import styles from './Section.module.scss';

const Section = ({ children }) => <div className={styles.section}>{children}</div>;
const Title = ({ children }) => <div className={styles.title}>{children}</div>;
const Label = ({ children }) => <div className={styles.label}>{children}</div>;
const Footer = ({ children, visible = true }) => (
  <div
    className={classNames(styles.footer, {
      [styles.invisible]: !visible,
    })}
  >
    {children}
  </div>
);
const Row = ({ children }) => <div className={styles.row}>{children}</div>;

Section.Title = Title;
Section.Label = Label;
Section.Footer = Footer;
Section.Row = Row;

export default Section;
