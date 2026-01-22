import classNames from 'classnames';

import Footer from './Footer';
import Label from './Label';
import Row from './Row';
import styles from './Section.module.scss';
import Title from './Title';

import Separator, { SeparatorWeight } from '@/dls/Separator/Separator';

interface SectionProps {
  id?: string;
  children?: React.ReactNode;
  hideSeparator?: boolean;
  className?: string;
}

const Section = ({ children, hideSeparator, className, ...props }: SectionProps) => (
  <div className={classNames(styles.section, className)} {...props}>
    {children}
    {!hideSeparator && (
      <div className={styles.separator}>
        <Separator weight={SeparatorWeight.Bold} />
      </div>
    )}
  </div>
);

Section.Title = Title;
Section.Label = Label;
Section.Footer = Footer;
Section.Row = Row;

export default Section;
