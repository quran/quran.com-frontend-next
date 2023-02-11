import React from 'react';

import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './AudioSectionUpdateNotice.module.scss';

import Button, { ButtonVariant } from '@/dls/Button/Button';
import Link, { LinkVariant } from '@/dls/Link/Link';
import { toLocalizedMonthName, toLocalizedNumber } from '@/utils/locale';

type Props = {
  onCloseClicked: () => void;
};

// TODO: UPDATE THIS on PROD
const PRODUCT_UPDATE_PAGE_ID = 'b3640190-3819-40c6-91b2-096b7fd07147';

const AudioSectionUpdateNotice: React.FC<Props> = ({ onCloseClicked }) => {
  const { lang } = useTranslation();
  return (
    <div className={styles.container}>
      {/* eslint-disable-next-line i18next/no-literal-string */}
      <Button variant={ButtonVariant.Ghost} onClick={onCloseClicked} className={styles.button}>
        X
      </Button>
      <div>
        <Trans
          components={{
            p: <p className={styles.learnMore} />,
            learnMore: (
              <Link
                isNewTab
                variant={LinkVariant.Blend}
                href={`/product-updates/${PRODUCT_UPDATE_PAGE_ID}`}
              />
            ),
          }}
          values={{
            month: toLocalizedMonthName(2, lang),
            day: toLocalizedNumber(30, lang),
          }}
          i18nKey="common:audio.update-notice"
        />
      </div>
    </div>
  );
};

export default AudioSectionUpdateNotice;
