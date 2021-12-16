import styles from './Footer.module.scss';
import Links from './Links';
import TitleAndDescription from './TitleAndDescription';

const Footer = () => {
  return (
    <div className={styles.container}>
      <TitleAndDescription />
      <Links />
    </div>
  );
};

export default Footer;
