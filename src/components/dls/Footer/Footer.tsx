import BottomSection from './BottomSection';
import styles from './Footer.module.scss';
import Links from './Links';
import TitleAndDescription from './TitleAndDescription';

const Footer = () => {
  return (
    <div>
      <div className={styles.container}>
        <TitleAndDescription />
        <Links />
      </div>
      <BottomSection />
    </div>
  );
};

export default Footer;
