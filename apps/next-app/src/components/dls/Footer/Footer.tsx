import BottomSection from './BottomSection';
import styles from './Footer.module.scss';
import Links from './Links';
import TitleAndDescription from './TitleAndDescription';

const Footer = () => {
  return (
    <footer>
      <div className={styles.flowItem}>
        <div className={styles.container}>
          <TitleAndDescription />
          <Links />
        </div>
        <BottomSection />
      </div>
      <div className={styles.emptySpacePlaceholder} />
    </footer>
  );
};

export default Footer;
