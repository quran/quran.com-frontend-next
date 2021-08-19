import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { QuranReaderStyles, selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import classNames from 'classnames';
import Verse from '../../../../types/Verse';
import Line from './Line';
import groupLinesByVerses from './groupLinesByVerses';
import styles from './Page.module.scss';
import PageFooter from './PageFooter';

type PageProps = {
  verses: Verse[];
  page: number;
};

const Page = ({ verses, page }: PageProps) => {
  const lines = useMemo(() => groupLinesByVerses(verses), [verses]);
  const { quranTextFontScale } = useSelector(selectQuranReaderStyles) as QuranReaderStyles;
  const hasSpecialLayout = quranTextFontScale > 3;

  return (
    <div
      id={`page-${page}`}
      className={classNames(styles.container, { [styles.centerText]: hasSpecialLayout })}
    >
      {Object.keys(lines).map((key) => (
        <Line lineKey={key} words={lines[key]} key={key} hasSpecialLayout={hasSpecialLayout} />
      ))}
      <PageFooter page={page} />
    </div>
  );
};

export default React.memo(Page);
