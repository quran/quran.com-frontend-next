/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import OverflowMenuIcon from '../../../../public/icons/menu_more_horiz.svg';
import VerifiedIcon from '../../../../public/icons/verified.svg';

import styles from './ReflectionItem.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from 'src/components/dls/Button/Button';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import { formatDate } from 'src/utils/datetime';
import { getQuranReflectPostUrl } from 'src/utils/navigation';
import { truncateString } from 'src/utils/string';
import { navigateToExternalUrl } from 'src/utils/url';

type ReflectionItemProps = {
  id: number;
  authorName: string;
  avatarUrl: string;
  date: string;
  reflectionText: string;
  isAuthorVerified: boolean;
};

const DEFAULT_IMAGE = '/images/quran-reflect.png';
const ReflectionItem = ({
  id,
  authorName,
  date,
  avatarUrl,
  reflectionText,
  isAuthorVerified,
}: ReflectionItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useTranslation('common');
  const formattedDate = formatDate(new Date(date));
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.authorInfo}>
          <img alt={authorName} className={styles.avatar} src={avatarUrl || DEFAULT_IMAGE} />
          <div>
            <div className={styles.author}>
              {authorName}
              {isAuthorVerified && (
                <span className={styles.verifiedIcon}>
                  <VerifiedIcon />
                </span>
              )}
            </div>
            <div className={styles.date}>{formattedDate}</div>
          </div>
        </div>
        <div>
          <PopoverMenu
            trigger={
              <Button
                size={ButtonSize.Small}
                tooltip={t('more')}
                variant={ButtonVariant.Ghost}
                shape={ButtonShape.Circle}
              >
                <OverflowMenuIcon />
              </Button>
            }
          >
            <PopoverMenu.Item
              onClick={() => {
                navigateToExternalUrl(getQuranReflectPostUrl(id));
              }}
            >
              {t('quran-reader:view-on-quran-reflect')}
            </PopoverMenu.Item>
          </PopoverMenu>
        </div>
      </div>
      <div>
        <span className={styles.body}>
          {isExpanded ? reflectionText : truncateString(reflectionText, 220)}
        </span>
        {reflectionText.length > 220 && (
          <span
            className={styles.moreOrLessText}
            tabIndex={0}
            role="button"
            onKeyDown={() => setIsExpanded(!isExpanded)}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'less' : 'more'}
          </span>
        )}
      </div>
    </div>
  );
};

export default ReflectionItem;
