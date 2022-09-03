import useTranslation from 'next-translate/useTranslation';

import styles from './TarteelAttribution.module.scss';

import Link from '@/dls/Link/Link';
import TarteelLogo from '@/icons/tarteel-logo.svg';
import TarteelText from '@/icons/tarteel-text.svg';
import { logTarteelLinkClick } from '@/utils/eventLogger';

interface Props {
  isCommandBar?: boolean;
}

const TarteelAttribution: React.FC<Props> = ({ isCommandBar = false }) => {
  const { t } = useTranslation('common');
  const onLinkClicked = () => {
    logTarteelLinkClick(isCommandBar ? 'command_bar' : 'search_drawer');
  };
  return (
    <Link href="https://download.tarteel.ai/" onClick={onLinkClicked} isNewTab>
      <div className={styles.container}>
        <span className={styles.poweredBy}>{t('voice.voice-search-powered-by')}</span>
        <TarteelLogo />
        <span className={styles.tarteelTextWrapper}>
          <TarteelText />
        </span>
      </div>
    </Link>
  );
};

export default TarteelAttribution;
