/* eslint-disable import/prefer-default-export */
/* eslint-disable max-lines */
import type { SyntaxAnalysisResult } from 'types/SyntaxAnalysis';

/**
 * Paste a full `SyntaxAnalysisResult` JSON object here while
 * `NEXT_PUBLIC_SYNTAX_ANALYSIS_MOCK=true` is set. No MCP/API call is made.
 *
 * Tip: paste from an API/tools response, keeping valid TypeScript/JSON shapes.
 */
export const SYNTAX_ANALYSIS_MOCK_RESPONSE: SyntaxAnalysisResult = {
  rootLetter: {
    arabicName: 'جذر تجريبي',
    rootLetter: 'كتب',
  },
  wordBreakDown: [
    { part: 'يَكتُبُ', meaning: '(example) writes' },
    { part: 'كتب', meaning: '(example) root k-t-b' },
  ],
  pattern: {
    wordPattern: '(example) 3rd person masculine singular imperfect verb',
    patternType: 'فعل مضارع',
  },
  ismChart: {
    Masculine: {
      Rafa: {
        singular: 'مُسْلِمٌ',
        dual: 'مُسْلِمَانِ',
        plural: 'مُسْلِمُونَ',
      },
      Nasab: {
        singular: 'مُسْلِمًا',
        dual: 'مُسْلِمَيْنِ',
        plural: 'مُسْلِمِينَ',
      },
      Jar: {
        singular: 'مُسْلِمٍ',
        dual: 'مُسْلِمَيْنِ',
        plural: 'مُسْلِمِينَ',
      },
    },
    Feminine: {
      Rafa: {
        singular: 'مُسْلِمَةٌ',
        dual: 'مُسْلِمَتَانِ',
        plural: 'مُسْلِمَاتٌ',
      },
      Nasab: {
        singular: 'مُسْلِمَةً',
        dual: 'مُسْلِمَتَيْنِ',
        plural: 'مُسْلِمَاتٍ',
      },
      Jar: {
        singular: 'مُسْلِمَةٍ',
        dual: 'مُسْلِمَتَيْنِ',
        plural: 'مُسْلِمَاتٍ',
      },
    },
  },
  verbPresentTenseChart: {
    '3rdPersonMasculine': {
      singular: {
        pronoun: 'هُوَ',
        meaning: 'He helps',
        verb: 'يَنْصُرُ',
      },
      dual: {
        pronoun: 'هُمَا',
        meaning: 'They (2) help',
        verb: 'يَنْصُرَانِ',
      },
      plural: {
        pronoun: 'هُمْ',
        meaning: 'They help',
        verb: 'يَنْصُرُونَ',
      },
    },
    '3rdPersonFeminine': {
      singular: {
        pronoun: 'هِيَ',
        meaning: 'She helps',
        verb: 'تَنْصُرُ',
      },
      dual: {
        pronoun: 'هُمَا',
        meaning: 'They (2f) help',
        verb: 'تَنْصُرَانِ',
      },
      plural: {
        pronoun: 'هُنَّ',
        meaning: 'They (f) help',
        verb: 'يَنْصُرْنَ',
      },
    },
    '2ndPersonMasculine': {
      singular: {
        pronoun: 'أَنْتَ',
        meaning: 'You help',
        verb: 'تَنْصُرُ',
      },
      dual: {
        pronoun: 'أَنْتُمَا',
        meaning: 'You (2) help',
        verb: 'تَنْصُرَانِ',
      },
      plural: {
        pronoun: 'أَنْتُمْ',
        meaning: 'You all help',
        verb: 'تَنْصُرُونَ',
      },
    },
    '2ndPersonFeminine': {
      singular: {
        pronoun: 'أَنْتِ',
        meaning: 'You (f) help',
        verb: 'تَنْصُرِينَ',
      },
      dual: {
        pronoun: 'أَنْتُمَا',
        meaning: 'You (2f) help',
        verb: 'تَنْصُرَانِ',
      },
      plural: {
        pronoun: 'أَنْتُنَّ',
        meaning: 'You all (f) help',
        verb: 'تَنْصُرْنَ',
      },
    },
    '1stPerson': {
      singular: {
        pronoun: 'أَنَا',
        meaning: 'I help',
        verb: 'أَنْصُرُ',
      },
      plural: {
        pronoun: 'نَحْنُ',
        meaning: 'We help',
        verb: 'نَنْصُرُ',
      },
    },
  },
  verbPastTenseChart: {
    '3rdPersonMasculine': {
      singular: {
        pronoun: 'هُوَ',
        meaning: 'He helped',
        verb: 'نَصَرَ',
      },
      dual: {
        pronoun: 'هُمَا',
        meaning: 'They (2) helped',
        verb: 'نَصَرَا',
      },
      plural: {
        pronoun: 'هُمْ',
        meaning: 'They helped',
        verb: 'نَصَرُوا',
      },
    },
    '3rdPersonFeminine': {
      singular: {
        pronoun: 'هِيَ',
        meaning: 'She helped',
        verb: 'نَصَرَتْ',
      },
      dual: {
        pronoun: 'هُمَا',
        meaning: 'They (2f) helped',
        verb: 'نَصَرَتَا',
      },
      plural: {
        pronoun: 'هُنَّ',
        meaning: 'They (f) helped',
        verb: 'نَصَرْنَ',
      },
    },
    '2ndPersonMasculine': {
      singular: {
        pronoun: 'أَنْتَ',
        meaning: 'You helped',
        verb: 'نَصَرْتَ',
      },
      dual: {
        pronoun: 'أَنْتُمَا',
        meaning: 'You (2) helped',
        verb: 'نَصَرْتُمَا',
      },
      plural: {
        pronoun: 'أَنْتُمْ',
        meaning: 'You all helped',
        verb: 'نَصَرْتُمْ',
      },
    },
    '2ndPersonFeminine': {
      singular: {
        pronoun: 'أَنْتِ',
        meaning: 'You (f) helped',
        verb: 'نَصَرْتِ',
      },
      dual: {
        pronoun: 'أَنْتُمَا',
        meaning: 'You (2f) helped',
        verb: 'نَصَرْتُمَا',
      },
      plural: {
        pronoun: 'أَنْتُنَّ',
        meaning: 'You all (f) helped',
        verb: 'نَصَرْتُنَّ',
      },
    },
    '1stPerson': {
      singular: {
        pronoun: 'أَنَا',
        meaning: 'I helped',
        verb: 'نَصَرْتُ',
      },
      plural: {
        pronoun: 'نَحْنُ',
        meaning: 'We helped',
        verb: 'نَصَرْنَا',
      },
    },
  },
  sarfChart: {
    columnHeaders: {
      pastTense: 'PastTense - فعل ماضى',
      presentTense: 'PresentTense - فعل مضارع',
      idea: 'Idea - مصدر',
      doer: 'Doer - اسم فاعل',
    },
    activeVoice: {
      pastTense: 'فَتَنَ',
      presentTense: 'يَفْتِنُ',
      idea: 'فِتْنَةً',
      doer: 'فَاتِنٌ',
    },
    passiveVoiceLabels: {
      pastTense: 'Passive - فعل ماضى مبنى للمجهول',
      presentTense: 'Passive - فعل مضارع مبنى للمجهول',
      idea: 'مصدر',
      doer: 'DoneTo - اسم مفعول',
    },
    passiveVoiceForms: {
      pastTense: 'فُتِنَ',
      presentTense: 'يُفْتَنُ',
      idea: 'فُتُونًا',
      doer: 'مَفْتُونٌ',
    },
    commandingLabels: {
      pastTense: 'Commanding - أمر',
      presentTense: 'Forbidding - نهى',
      idea: 'TimeAndPlace - ظرف',
    },
    commandingForms: {
      pastTense: 'إِفْتِنْ',
      presentTense: 'لَا تَفْتِنْ',
      idea: 'مَفْتَنٌ | مَفْتِنٌ | مَفْتَنَةٌ',
    },
  },
};
