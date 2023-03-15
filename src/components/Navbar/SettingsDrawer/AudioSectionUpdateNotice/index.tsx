/* eslint-disable i18next/no-literal-string */
import React from 'react';

import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './AudioSectionUpdateNotice.module.scss';

import Button, { ButtonVariant } from '@/dls/Button/Button';
import Link, { LinkVariant } from '@/dls/Link/Link';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedMonthName, toLocalizedNumber } from '@/utils/locale';

type Props = {
  onCloseClicked: () => void;
};

const PRODUCT_UPDATE_PAGE_ID = 'simplifying-word-by-word-and-audio-settings';

const AudioSectionUpdateNotice: React.FC<Props> = ({ onCloseClicked }) => {
  const { lang } = useTranslation();
  const onProductPageLinkClicked = () => {
    logButtonClick('wbw_consolidate_product_page');
  };

  const onCloseButtonClicked = () => {
    logButtonClick('wbw_consolidate_notice_close');
    onCloseClicked();
  };
  return (
    <div className={styles.container}>
      <Button
        variant={ButtonVariant.Ghost}
        onClick={onCloseButtonClicked}
        className={styles.button}
      >
        X
      </Button>
      <div>
        <Trans
          components={{
            p: <p className={styles.learnMore} />,
            learnMore: (
              <Link
                onClick={onProductPageLinkClicked}
                isNewTab
                variant={LinkVariant.Blend}
                href={`/product-updates/${PRODUCT_UPDATE_PAGE_ID}`}
              />
            ),
          }}
          values={{
            month: toLocalizedMonthName(3, lang),
            day: toLocalizedNumber(14, lang),
          }}
          i18nKey="common:audio.update-notice"
        />
      </div>
    </div>
  );
};

export default AudioSectionUpdateNotice;
