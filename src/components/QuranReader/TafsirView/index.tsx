/* eslint-disable react/no-multi-comp */
/* eslint-disable react/no-danger */

import React from 'react';

import classNames from 'classnames';
import { shallowEqual, useSelector } from 'react-redux';

import styles from './TafsirView.module.scss';

import Button from 'src/components/dls/Button/Button';
import Select, { SelectSize } from 'src/components/dls/Forms/Select';
import Modal from 'src/components/dls/Modal/Modal';
import Separator from 'src/components/dls/Separator/Separator';
import VerseText from 'src/components/Verse/VerseText';
import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import { getVerseWords } from 'src/utils/verse';
import Verse from 'types/Verse';

interface Props {
  verse: Verse;
}

const RTL_LANGUAGES = [
  'urdu',
  'persian',
  'hebrew',
  'pashto',
  'arabic',
  'divehi',
  'dhivehi',
  'uyghur',
  'uighur',
  'test1',
  'test2fafdfas',
  'somesfasfs',
  'test4',
  'test5',
];

const TafsirSelection = () => {
  return (
    <div style={{ display: 'flex', marginBlockStart: '1rem', overflowX: 'scroll' }}>
      {RTL_LANGUAGES.map((x) => {
        const selected = x === 'persian';
        return (
          <div
            key={x}
            style={{
              textTransform: 'capitalize',
              marginInlineEnd: '1rem',
              paddingInline: '1rem',
              paddingBlock: '0.5rem',
              borderRadius: '0.5rem',
              backgroundColor: selected ? 'var(--color-success-medium)' : '#F2F2F2',
              color: selected ? '#fff' : null,
            }}
          >
            {x}
          </div>
        );
      })}
    </div>
  );
};

const TafsirView: React.FC<Props> = ({ verse }) => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual) as QuranReaderStyles;
  return (
    <div className={styles.container}>
      <VerseText words={getVerseWords(verse)} />

      <Modal isFullView trigger={<Button>This is a regular button component</Button>}>
        <Modal.Body>
          <div style={{ overflowY: 'scroll', height: '80vh' }}>
            <div className="selectionsContainer" style={{ display: 'flex' }}>
              <Select
                size={SelectSize.Small}
                id="surah-selection"
                name="surah-selection"
                options={[
                  {
                    label: 'Al-Fatihah',
                    value: 'al-fatihah',
                  },
                ]}
                value="al-fatihah"
              />
              <div style={{ marginInlineStart: '1rem' }}>
                <Select
                  size={SelectSize.Small}
                  id="ayah-selection"
                  name="ayah-selection"
                  options={[
                    {
                      label: '1',
                      value: '1',
                    },
                  ]}
                  value="al-fatihah"
                />
              </div>
            </div>
            <TafsirSelection />
            <VerseText words={getVerseWords(verse)} />
            <Separator />
            {verse.tafsirs?.map((tafsir) => {
              return (
                <div
                  key={tafsir.id}
                  className={classNames(
                    styles.tafsirContainer,
                    styles[`tafsir-font-size-${quranReaderStyles.tafsirFontScale}`],
                  )}
                  dangerouslySetInnerHTML={{ __html: tafsir.text }}
                />
              );
            })}
          </div>
        </Modal.Body>
      </Modal>

      {verse.tafsirs?.map((tafsir, index) => {
        const isRtl = RTL_LANGUAGES.includes(tafsir.languageName);
        // Only add the first Tafsir's name as an h1
        const TafsirNameContainer = index === 0 ? 'h1' : 'p';
        return (
          <div key={tafsir.id}>
            {tafsir.resourceName && (
              <TafsirNameContainer
                className={classNames(styles.tafsirName, { [styles.rtl]: isRtl })}
              >
                {tafsir.resourceName}
              </TafsirNameContainer>
            )}
            <div
              className={classNames(
                styles.tafsirContainer,
                styles[`tafsir-font-size-${quranReaderStyles.tafsirFontScale}`],
                { [styles.rtl]: isRtl },
              )}
              dangerouslySetInnerHTML={{ __html: tafsir.text }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default TafsirView;
