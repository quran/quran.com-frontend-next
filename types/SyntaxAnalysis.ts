/**
 * Structured morphology output for an Arabic word (e.g. Uthmani script).
 * Returned by `/api/syntax/analyze` and `syntaxAnalysisService`.
 */
/** Root metadata from the analyzer (same shape as /api/syntax/analyze required rootLetter). */
export type SyntaxAnalysisRootLetter = {
  /** Short Arabic label or gloss for the root */
  arabicName: string;
  /** Lexical root consonants in Arabic script (often ثلاثي) */
  rootLetter: string;
};

export type SyntaxAnalysisBreakdownPart = {
  part: string;
  meaning: string;
};

/** Surface pattern — mirrors API: Arabic category + optional English morphological gloss. */
export type SyntaxAnalysisPattern = {
  /** Morphological description (often English: person, gender, number, form, etc.) */
  wordPattern: string;
  /** Arabic grammatical category (e.g. فعل ماضي، اسم فاعل) */
  patternType: string;
};

/** One row of اسم declension (singular / dual / plural). */
export type SyntaxAnalysisIsmCaseRow = {
  singular: string;
  dual: string;
  plural: string;
};

/** Declension by grammatical case for one gender. */
export type SyntaxAnalysisIsmGender = {
  Rafa: SyntaxAnalysisIsmCaseRow;
  Nasab: SyntaxAnalysisIsmCaseRow;
  Jar: SyntaxAnalysisIsmCaseRow;
};

/** Full اسم chart (masculine / feminine). */
export type SyntaxAnalysisIsmChart = {
  Masculine: SyntaxAnalysisIsmGender;
  Feminine: SyntaxAnalysisIsmGender;
};

export type SyntaxAnalysisVerbSlot = {
  pronoun: string;
  meaning: string;
  verb: string;
  /** Inflection segment at end of `verb`; rendered in accent color when it matches */
  verbSuffix?: string;
};

export type SyntaxAnalysisVerbPerson = {
  singular?: SyntaxAnalysisVerbSlot;
  dual?: SyntaxAnalysisVerbSlot;
  plural?: SyntaxAnalysisVerbSlot;
};

/** Verb conjugation grid — same shape for past, present, etc. */
export type SyntaxAnalysisVerbChart = {
  '3rdPersonMasculine': SyntaxAnalysisVerbPerson;
  '3rdPersonFeminine': SyntaxAnalysisVerbPerson;
  '2ndPersonMasculine': SyntaxAnalysisVerbPerson;
  '2ndPersonFeminine': SyntaxAnalysisVerbPerson;
  '1stPerson': SyntaxAnalysisVerbPerson;
};

/** Four Sarf columns — DOM order with `dir="rtl"` on the table is Past → Present → Idea → Doer (reading RTL). */
export type SyntaxAnalysisSarfColumnKey =
  | 'pastTense'
  | 'presentTense'
  | 'idea'
  | 'doer';

/**
 * Verb-derived morphology chart (مصدر، اسم فاعل، صيغ أمر/نهي، مجهول، ظرف، إلخ).
 * Matches the Study Mode Sarf grid: header row, active forms, passive labels/forms, commanding labels/forms.
 */
export type SyntaxAnalysisSarfChart = {
  columnHeaders: Record<SyntaxAnalysisSarfColumnKey, string>;
  activeVoice: Record<SyntaxAnalysisSarfColumnKey, string>;
  passiveVoiceLabels: Partial<Record<SyntaxAnalysisSarfColumnKey, string>>;
  passiveVoiceForms: Partial<Record<SyntaxAnalysisSarfColumnKey, string>>;
  commandingLabels: Partial<Record<SyntaxAnalysisSarfColumnKey, string>>;
  commandingForms: Partial<Record<SyntaxAnalysisSarfColumnKey, string>>;
};

export type SyntaxAnalysisResult = {
  rootLetter: SyntaxAnalysisRootLetter;
  wordBreakDown: SyntaxAnalysisBreakdownPart[];
  pattern: SyntaxAnalysisPattern;
  /** Optional extended charts (e.g. mocks) */
  ismChart?: SyntaxAnalysisIsmChart;
  /** @deprecated Use verbPastTenseChart */
  verbChart?: SyntaxAnalysisVerbChart;
  verbPresentTenseChart?: SyntaxAnalysisVerbChart;
  verbPastTenseChart?: SyntaxAnalysisVerbChart;
  sarfChart?: SyntaxAnalysisSarfChart;
};
