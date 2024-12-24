import React from 'react';

import useReflectionBodyParser from '../hooks/useReflectionBodyParser';

import styles from './ReflectionText.module.scss';

type Props = {
  reflectionText: string;
};

const ReflectionText: React.FC<Props> = ({ reflectionText }) => {
  const formattedText = useReflectionBodyParser(reflectionText, styles.hashtag);
  return (
    <span
      className={styles.body}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: formattedText,
      }}
    />
  );
};

export default ReflectionText;
