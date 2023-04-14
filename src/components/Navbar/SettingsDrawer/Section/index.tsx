import Footer from './Footer';
import Label from './Label';
import Row from './Row';
import styles from './Section.module.scss';
import Title from './Title';

import Separator, { SeparatorWeight } from '@/dls/Separator/Separator';

const Section = ({ children }) => (
  <div className={styles.section}>
    {children}
    <div className={styles.separator}>
      <Separator weight={SeparatorWeight.Bold} />
    </div>
  </div>
);

Section.Title = Title;
Section.Label = Label;
Section.Footer = Footer;
Section.Row = Row;

export default Section;
