/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useEffect, useRef, useMemo } from 'react';

import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './QueryParamMessage.module.scss';

interface Props {
  translationsQueryParamUsed: boolean;
  reciterQueryParamUsed: boolean;
  wordByWordLocaleQueryParamUsed: boolean;
  setShouldOverrideQueryParam: (shouldOverrideQueryParam: boolean) => void;
  setShouldPersistQueryParam: (shouldPersistQueryParam: boolean) => void;
}

const QueryParamMessage: React.FC<Props> = ({
  translationsQueryParamUsed,
  reciterQueryParamUsed,
  wordByWordLocaleQueryParamUsed,
  setShouldOverrideQueryParam,
  setShouldPersistQueryParam,
}) => {
  const { t } = useTranslation('common');
  const numberOfUsedParams = useRef(0);

  useEffect(() => {
    if (translationsQueryParamUsed) {
      numberOfUsedParams.current += 1;
    }
    if (reciterQueryParamUsed) {
      numberOfUsedParams.current += 1;
    }
    if (wordByWordLocaleQueryParamUsed) {
      numberOfUsedParams.current += 1;
    }
  }, [translationsQueryParamUsed, reciterQueryParamUsed, wordByWordLocaleQueryParamUsed]);

  // eslint-disable-next-line react-func/max-lines-per-function
  const text = useMemo(() => {
    let usedParamsText = '';
    if (numberOfUsedParams.current === 1) {
      if (translationsQueryParamUsed) {
        usedParamsText = t('translations');
      } else if (reciterQueryParamUsed) {
        usedParamsText = t('reciter');
      } else if (wordByWordLocaleQueryParamUsed) {
        usedParamsText = t('wbw-trans-lang');
      }
    } else if (numberOfUsedParams.current === 2) {
      let isFirst = true;
      if (translationsQueryParamUsed) {
        usedParamsText = isFirst
          ? `${t('translations')} ${t('and')}`
          : `${usedParamsText} ${t('translations')}`;
        isFirst = false;
      }
      if (reciterQueryParamUsed) {
        usedParamsText = isFirst
          ? `${t('reciter')} ${t('and')}`
          : `${usedParamsText} ${t('reciter')}`;
        isFirst = false;
      }
      if (wordByWordLocaleQueryParamUsed) {
        usedParamsText = isFirst
          ? `${t('wbw-trans-lang')} ${t('and')}`
          : `${usedParamsText} ${t('wbw-trans-lang')}`;
        isFirst = false;
      }
    } else {
      usedParamsText = `${t('translations')}, ${t('reciter')} ${t('and')} ${t('wbw-trans-lang')}`;
    }
    return usedParamsText;
  }, [reciterQueryParamUsed, translationsQueryParamUsed, wordByWordLocaleQueryParamUsed, t]);

  const onUseReduxValuesClicked = () => {
    setShouldOverrideQueryParam(true);
  };

  const onPersistQueryParamsClicked = () => {
    setShouldPersistQueryParam(true);
  };

  return (
    <div className={styles.container}>
      <Trans
        i18nKey="quran-reader:query-param-message"
        components={[
          <span key={0}>{text}</span>,
          <span key={1} onClick={onUseReduxValuesClicked} className={styles.link} />,
          <span key={2} onClick={onPersistQueryParamsClicked} className={styles.link} />,
        ]}
      />
    </div>
  );
};

export default QueryParamMessage;
