import Separator from 'src/components/dls/Separator/Separator';
import styles from './Section.module.scss';
import Title from './Title';
import Label from './Label';
import Row from './Row';
import Footer from './Footer';

const Section = ({ children }) => (
  <div className={styles.section}>
    {children}
    <div className={styles.separator}>
      <Separator />
    </div>
  </div>
);

Section.Title = Title;
Section.Label = Label;
Section.Footer = Footer;
Section.Row = Row;

export default Section;
