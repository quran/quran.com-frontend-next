/* eslint-disable max-lines */
/* eslint-disable react/no-multi-comp */
/* eslint-disable i18next/no-literal-string */
import React from 'react';

import classNames from 'classnames';

import styles from './SyntaxView.module.scss';
import useSyntaxChartArabicTypography from './useSyntaxChartArabicTypography';

import type {
  SyntaxAnalysisIsmChart,
  SyntaxAnalysisSarfChart,
  SyntaxAnalysisSarfColumnKey,
  SyntaxAnalysisVerbChart,
  SyntaxAnalysisVerbSlot,
} from 'types/SyntaxAnalysis';

const VERB_PERSON_LABELS: Record<keyof SyntaxAnalysisVerbChart, string> = {
  '3rdPersonMasculine': 'Masculine 3rd person',
  '3rdPersonFeminine': 'Feminine 3rd person',
  '2ndPersonMasculine': 'Masculine 2nd person',
  '2ndPersonFeminine': 'Feminine 2nd person',
  '1stPerson': '1st Person',
};

const ISM_CASES = ['Rafa', 'Nasab', 'Jar'] as const;

/** Sarf columns — with `dir="rtl"` on the table, first cell is Past (visual right). */
const SYNTAX_SARF_COLUMN_ORDER: SyntaxAnalysisSarfColumnKey[] = [
  'pastTense',
  'presentTense',
  'idea',
  'doer',
];

/** Stable row order for verb conjugation table */
const VERB_CHART_ORDER: (keyof SyntaxAnalysisVerbChart)[] = [
  '3rdPersonMasculine',
  '3rdPersonFeminine',
  '2ndPersonMasculine',
  '2ndPersonFeminine',
  '1stPerson',
];

function VerbFormCell({
  slot,
  colSpan,
  verbTypographyClassName,
  arabicTypographyStyle,
}: {
  slot: SyntaxAnalysisVerbSlot;
  colSpan?: number;
  verbTypographyClassName: string;
  arabicTypographyStyle: React.CSSProperties;
}) {
  return (
    <td colSpan={colSpan} className={styles.syntaxVerbChartVerbCell} lang="ar">
      <div
        dir="rtl"
        style={arabicTypographyStyle}
        className={classNames(styles.syntaxVerbChartVerbInner, verbTypographyClassName)}
      >
        {slot.verb}
      </div>
    </td>
  );
}

function MeaningCell({
  slot,
  meaningTypographyClassName,
  arabicTypographyStyle,
}: {
  slot: SyntaxAnalysisVerbSlot;
  meaningTypographyClassName: string;
  arabicTypographyStyle: React.CSSProperties;
}) {
  return (
    <td className={styles.syntaxVerbChartMeaningCell}>
      <div className={styles.syntaxVerbChartMeaningInner}>
        <span className={styles.syntaxVerbChartMeaningEn}>{slot.meaning}</span>
        <span
          dir="rtl"
          lang="ar"
          style={arabicTypographyStyle}
          className={classNames(styles.syntaxVerbChartMeaningPronoun, meaningTypographyClassName)}
        >
          {slot.pronoun}
        </span>
      </div>
    </td>
  );
}

type Props = {
  verbChart?: SyntaxAnalysisVerbChart;
  verbPresentTenseChart?: SyntaxAnalysisVerbChart;
  verbPastTenseChart?: SyntaxAnalysisVerbChart;
  ismChart?: SyntaxAnalysisIsmChart;
  sarfChart?: SyntaxAnalysisSarfChart;
};

export const SyntaxVerbChartTable: React.FC<{
  chart: SyntaxAnalysisVerbChart;
  title: string;
}> = ({ chart, title }) => {
  const { arabicTypographyStyle, verbTypographyClassName, meaningTypographyClassName } =
    useSyntaxChartArabicTypography();

  const sections: React.ReactNode[] = [];

  VERB_CHART_ORDER.forEach((personKey) => {
    if (!(personKey in chart)) return;
    const block = chart[personKey];
    const personLabel = VERB_PERSON_LABELS[personKey];

    if (personKey === '1stPerson') {
      const sg = block.singular;
      const pl = block.plural;
      if (!sg || !pl) return;

      sections.push(
        <React.Fragment key={personKey}>
          <tr>
            <td colSpan={2} className={styles.syntaxVerbChartMeaningCell}>
              <div className={styles.syntaxVerbChartMeaningInner}>
                <span className={styles.syntaxVerbChartMeaningEn}>{pl.meaning}</span>
                <span
                  dir="rtl"
                  lang="ar"
                  style={arabicTypographyStyle}
                  className={classNames(
                    styles.syntaxVerbChartMeaningPronoun,
                    meaningTypographyClassName,
                  )}
                >
                  {pl.pronoun}
                </span>
              </div>
            </td>
            <MeaningCell
              slot={sg}
              meaningTypographyClassName={meaningTypographyClassName}
              arabicTypographyStyle={arabicTypographyStyle}
            />
            <th scope="row" rowSpan={2} className={styles.syntaxVerbChartPersonCell}>
              {personLabel}
            </th>
          </tr>
          <tr>
            <VerbFormCell
              slot={pl}
              colSpan={2}
              verbTypographyClassName={verbTypographyClassName}
              arabicTypographyStyle={arabicTypographyStyle}
            />
            <VerbFormCell
              slot={sg}
              verbTypographyClassName={verbTypographyClassName}
              arabicTypographyStyle={arabicTypographyStyle}
            />
          </tr>
        </React.Fragment>,
      );
      return;
    }

    const pl = block.plural;
    const du = block.dual;
    const sg = block.singular;
    if (!pl || !du || !sg) return;

    sections.push(
      <React.Fragment key={personKey}>
        <tr>
          <MeaningCell
            slot={pl}
            meaningTypographyClassName={meaningTypographyClassName}
            arabicTypographyStyle={arabicTypographyStyle}
          />
          <MeaningCell
            slot={du}
            meaningTypographyClassName={meaningTypographyClassName}
            arabicTypographyStyle={arabicTypographyStyle}
          />
          <MeaningCell
            slot={sg}
            meaningTypographyClassName={meaningTypographyClassName}
            arabicTypographyStyle={arabicTypographyStyle}
          />
          <th scope="row" rowSpan={2} className={styles.syntaxVerbChartPersonCell}>
            {personLabel}
          </th>
        </tr>
        <tr>
          <VerbFormCell
            slot={pl}
            verbTypographyClassName={verbTypographyClassName}
            arabicTypographyStyle={arabicTypographyStyle}
          />
          <VerbFormCell
            slot={du}
            verbTypographyClassName={verbTypographyClassName}
            arabicTypographyStyle={arabicTypographyStyle}
          />
          <VerbFormCell
            slot={sg}
            verbTypographyClassName={verbTypographyClassName}
            arabicTypographyStyle={arabicTypographyStyle}
          />
        </tr>
      </React.Fragment>,
    );
  });

  if (sections.length === 0) return null;

  return (
    <div className={styles.syntaxTableSection}>
      <h4 className={styles.syntaxTableTitle}>{title}</h4>
      <div className={styles.syntaxTableScroll}>
        <table className={`${styles.syntaxTable} ${styles.syntaxVerbChartTable}`}>
          <thead>
            <tr>
              <th scope="col">Plural</th>
              <th scope="col">Pair</th>
              <th scope="col">Singular</th>
              <th scope="col" aria-label="Person / gender" />
            </tr>
          </thead>
          <tbody>{sections}</tbody>
        </table>
      </div>
    </div>
  );
};

export const SyntaxIsmChartTable: React.FC<{ chart: SyntaxAnalysisIsmChart }> = ({ chart }) => {
  const { arabicTypographyStyle, verbTypographyClassName } = useSyntaxChartArabicTypography();

  return (
    <div className={styles.syntaxTableSection}>
      <h4 className={styles.syntaxTableTitle}>Ism chart (declension)</h4>
      <div className={styles.syntaxTableScroll}>
        <table className={styles.syntaxTable}>
          <thead>
            <tr>
              <th scope="col" colSpan={3}>
                Feminine
              </th>
              <th scope="col" colSpan={3}>
                Masculine
              </th>
              <th scope="col">Case</th>
            </tr>
            <tr>
              <th scope="col">Plural</th>
              <th scope="col">Dual</th>
              <th scope="col">Singular</th>
              <th scope="col">Plural</th>
              <th scope="col">Dual</th>
              <th scope="col">Singular</th>
              <th scope="col" aria-label="Case category" />
            </tr>
          </thead>
          <tbody>
            {ISM_CASES.map((caseName) => (
              <tr key={caseName}>
                <td dir="rtl" lang="ar">
                  <span style={arabicTypographyStyle} className={verbTypographyClassName}>
                    {chart.Feminine[caseName].plural}
                  </span>
                </td>
                <td dir="rtl" lang="ar">
                  <span style={arabicTypographyStyle} className={verbTypographyClassName}>
                    {chart.Feminine[caseName].dual}
                  </span>
                </td>
                <td dir="rtl" lang="ar">
                  <span style={arabicTypographyStyle} className={verbTypographyClassName}>
                    {chart.Feminine[caseName].singular}
                  </span>
                </td>
                <td dir="rtl" lang="ar">
                  <span style={arabicTypographyStyle} className={verbTypographyClassName}>
                    {chart.Masculine[caseName].plural}
                  </span>
                </td>
                <td dir="rtl" lang="ar">
                  <span style={arabicTypographyStyle} className={verbTypographyClassName}>
                    {chart.Masculine[caseName].dual}
                  </span>
                </td>
                <td dir="rtl" lang="ar">
                  <span style={arabicTypographyStyle} className={verbTypographyClassName}>
                    {chart.Masculine[caseName].singular}
                  </span>
                </td>
                <th scope="row">{caseName}</th>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const SyntaxSarfChartTable: React.FC<{ chart: SyntaxAnalysisSarfChart }> = ({ chart }) => {
  const { arabicTypographyStyle, verbTypographyClassName } = useSyntaxChartArabicTypography();

  const headerCells = SYNTAX_SARF_COLUMN_ORDER.map((key) => (
    <th key={key} scope="col" className={styles.syntaxSarfChartHeaderCell}>
      {chart.columnHeaders[key]}
    </th>
  ));

  const labelCells = (get: (k: SyntaxAnalysisSarfColumnKey) => string | undefined) =>
    SYNTAX_SARF_COLUMN_ORDER.map((key) => (
      <td key={key} className={styles.syntaxSarfChartLabelCell}>
        {get(key) ?? ''}
      </td>
    ));

  const formCells = (get: (k: SyntaxAnalysisSarfColumnKey) => string | undefined) =>
    SYNTAX_SARF_COLUMN_ORDER.map((key) => {
      const text = get(key)?.trim();
      if (!text) {
        return <td key={key} className={styles.syntaxSarfChartDataCell} aria-hidden="true" />;
      }
      return (
        <td key={key} className={styles.syntaxSarfChartDataCell} dir="rtl" lang="ar">
          <div
            style={arabicTypographyStyle}
            className={classNames(styles.syntaxSarfChartArabic, verbTypographyClassName)}
          >
            {text}
          </div>
        </td>
      );
    });

  return (
    <div className={styles.syntaxTableSection}>
      <h4 className={styles.syntaxTableTitle}>Sarf chart</h4>
      <div className={styles.syntaxTableScroll}>
        <table className={`${styles.syntaxTable} ${styles.syntaxSarfChartTable}`} dir="rtl">
          <thead>
            <tr>{headerCells}</tr>
          </thead>
          <tbody>
            <tr>{formCells((k) => chart.activeVoice[k])}</tr>
            <tr>{labelCells((k) => chart.passiveVoiceLabels[k])}</tr>
            <tr>{formCells((k) => chart.passiveVoiceForms[k])}</tr>
            <tr>{labelCells((k) => chart.commandingLabels[k])}</tr>
            <tr>{formCells((k) => chart.commandingForms[k])}</tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const SyntaxAnalysisCharts: React.FC<Props> = ({
  verbChart,
  verbPresentTenseChart,
  verbPastTenseChart,
  ismChart,
  sarfChart,
}) => (
  <>
    {sarfChart && <SyntaxSarfChartTable chart={sarfChart} />}
    {verbPresentTenseChart && (
      <SyntaxVerbChartTable chart={verbPresentTenseChart} title="Verb chart (present tense)" />
    )}
    {verbPastTenseChart && (
      <SyntaxVerbChartTable chart={verbPastTenseChart} title="Verb chart (past tense)" />
    )}
    {verbChart && (
      <SyntaxVerbChartTable
        chart={verbChart}
        title={
          verbPastTenseChart || verbPresentTenseChart
            ? 'Verb chart (legacy verbChart)'
            : 'Verb chart'
        }
      />
    )}
    {ismChart && <SyntaxIsmChartTable chart={ismChart} />}
  </>
);
