/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import styles from './SearchItem.module.scss';

import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';

type SearchItemProps = {
  prefix: React.ReactNode;
  title: string;
  suffix?: React.ReactNode;
  onClick?: () => void;
};

const SearchItem = ({ title, prefix: icon, suffix, onClick }: SearchItemProps) => {
  return (
    <div className={styles.item}>
      <span className={styles.prefix}>
        <IconContainer size={IconSize.Small} color={IconColor.secondary} icon={icon} />
      </span>
      <span className={styles.itemContent} onClick={onClick}>
        {title}
      </span>
      {suffix && <span>{suffix}</span>}
    </div>
  );
};

export default SearchItem;
