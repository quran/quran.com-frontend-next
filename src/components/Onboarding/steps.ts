/* eslint-disable max-lines */
import { Translate } from 'next-translate';
import { Step as BaseStep } from 'react-joyride';

// import OnboardingStep from './OnboardingStep';

import OnboardingGroup from '@/types/OnboardingGroup';
import { getSurahNavigationUrl } from '@/utils/navigation';

type Step = BaseStep & {
  showNextButton?: boolean;
  showPrevButton?: boolean;
};

// eslint-disable-next-line react-func/max-lines-per-function
export const checklistIndexToOnboardingSteps = (
  t: Translate,
  component: React.ElementType,
): Record<
  OnboardingGroup,
  {
    title: string;
    description: string;
    step: Partial<Step>;
  }[]
> => {
  const commonStepOptions: Partial<Step> = {
    content: '',
    placement: 'auto',
    disableBeacon: true,
    hideBackButton: true,
    disableOverlay: false,
    disableOverlayClose: true,
    tooltipComponent: component as any,
    floaterProps: {
      hideArrow: true,
    },
    spotlightPadding: 10,
  };

  const getDetails = (key: string) => ({
    title: t(`onboarding:steps.${key}.title`),
    description: t(`onboarding:steps.${key}.description`),
  });

  return {
    [OnboardingGroup.HOMEPAGE]: [
      {
        ...getDetails('quran-radio'),
        step: {
          ...commonStepOptions,
          target: '#radio-button',
          showSkipButton: true,
        },
      },
      {
        ...getDetails('search-bar'),
        step: {
          ...commonStepOptions,
          target: '#command-bar',
        },
      },
      {
        ...getDetails('voice-search'),
        step: {
          ...commonStepOptions,
          target: '#voice-search-trigger',
          placement: 'bottom',
        },
      },

      {
        ...getDetails('juz'),
        step: {
          ...commonStepOptions,
          target: '#juz-tab',
        },
      },
    ],
    [OnboardingGroup.SETTINGS]: [
      {
        ...getDetails('settings'),
        step: {
          ...commonStepOptions,
          target: '#settings-button',
          showNextButton: false,
          showSkipButton: true,
          spotlightClicks: true,
        },
      },
      {
        ...getDetails('theme'),
        step: {
          ...commonStepOptions,
          target: '#theme-section',
          spotlightClicks: true,
          placement: 'left-start',
          disableScrolling: true,
        },
      },
      {
        ...getDetails('font-style'),
        step: {
          ...commonStepOptions,
          target: '#quran-font-section',
          spotlightClicks: true,
          placement: 'left-start',
          disableScrolling: true,
        },
      },
      {
        ...getDetails('font-size'),
        step: {
          ...commonStepOptions,
          target: '#font-size-section',
          spotlightClicks: true,
          placement: 'left-start',
          disableScrolling: true,
        },
      },
      {
        ...getDetails('wbw-translation'),
        step: {
          ...commonStepOptions,
          target: '#word-by-word-section',
          spotlightClicks: true,
          placement: 'left-start',
        },
      },
      {
        ...getDetails('wbw-transliteration'),
        step: {
          ...commonStepOptions,
          target: '#word-by-word-section',
          spotlightClicks: true,
          placement: 'left-start',
          disableScrolling: true,
        },
      },
      {
        ...getDetails('wbw-audio'),
        step: {
          ...commonStepOptions,
          target: '#word-by-word-section',
          spotlightClicks: true,
          placement: 'left-start',
          disableScrolling: true,
        },
      },
      {
        ...getDetails('inline-wbw'),
        step: {
          ...commonStepOptions,
          target: '#word-by-word-section',
          spotlightClicks: true,
          placement: 'left-start',
          disableScrolling: true,
        },
      },
      {
        ...getDetails('translations'),
        step: {
          ...commonStepOptions,
          target: '#translation-section',
          spotlightClicks: true,
          placement: 'left-start',
        },
      },
    ],
    [OnboardingGroup.READING_EXPERIENCE]: [
      {
        ...getDetails('surah-info'),
        step: {
          ...commonStepOptions,
          target: '#surah-info-button',
          placement: 'left-start',
        },
      },
      {
        ...getDetails('listen'),
        step: {
          ...commonStepOptions,
          // first element with class play-verse-button
          target: '.play-verse-button:first-child',
          spotlightClicks: true,
          showNextButton: false,
          showPrevButton: false,
        },
      },
      {
        ...getDetails('select-reciter'),
        step: {
          ...commonStepOptions,
          target: '#audio-player-overflow-menu-trigger',
          disableScrolling: true,
        },
      },
      {
        ...getDetails('ayah-tafsir'),
        step: {
          ...commonStepOptions,
          target: '.tafsir-verse-button',
        },
      },
      {
        ...getDetails('ayah-reflection'),
        step: {
          ...commonStepOptions,
          target: '.reflection-verse-button',
        },
      },
      {
        ...getDetails('3-dot-menu'),
        step: {
          ...commonStepOptions,
          target: '.overflow-verse-actions-menu-trigger',
        },
      },
      {
        ...getDetails('reading-view'),
        step: {
          ...commonStepOptions,
          target: '#reading-preference-switcher',
          spotlightClicks: true,
        },
      },
    ],
    [OnboardingGroup.PERSONALIZED_FEATURES]: [
      {
        ...getDetails('login'),
        step: {
          ...commonStepOptions,
          target: '#login-button',
        },
      },
    ],
  };
};

export const onboardingChecklist = (t: Translate) => [
  {
    group: OnboardingGroup.HOMEPAGE,
    title: t('onboarding:checklist.1'),
    href: '/',
  },
  {
    group: OnboardingGroup.SETTINGS,
    title: t('onboarding:checklist.2'),
    href: '/',
  },
  {
    group: OnboardingGroup.READING_EXPERIENCE,
    title: t('onboarding:checklist.3'),
    href: getSurahNavigationUrl(1),
  },
  {
    group: OnboardingGroup.PERSONALIZED_FEATURES,
    title: t('onboarding:checklist.4'),
    href: '/login',
  },
];
