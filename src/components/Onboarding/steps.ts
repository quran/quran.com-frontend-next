/* eslint-disable max-lines */
import { Translate } from 'next-translate';
import { Step as BaseStep, Placement } from 'react-joyride';

// import OnboardingStep from './OnboardingStep';

import OnboardingGroup from '@/types/OnboardingGroup';
import { getSurahNavigationUrl } from '@/utils/navigation';
import { isMobile } from '@/utils/responsive';

type Step = BaseStep & {
  showNextButton?: boolean;
  showPrevButton?: boolean;
};

/**
 * Get the placement for the tooltip based on the device
 *
 * @param {Placement} desktopPlacement
 * @param {boolean} isDeviceMobile
 * @returns {Placement}
 */
const getResponsivePlacement = (
  desktopPlacement: Placement,
  isDeviceMobile: boolean,
): Placement => {
  return isDeviceMobile ? 'top-start' : desktopPlacement;
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
    placement: 'auto',
    disableBeacon: true,
    hideBackButton: true,
    disableOverlayClose: true,
    tooltipComponent: component as any,
    floaterProps: {
      hideArrow: false,
    },
    spotlightPadding: 5,
  };

  const getDetails = (key: string) => ({
    title: t(`onboarding:steps.${key}.title`),
    description: t(`onboarding:steps.${key}.description`),
  });

  const isDeviceMobile = isMobile();
  const shouldDisableOverlay = isDeviceMobile;

  return {
    [OnboardingGroup.HOMEPAGE]: [
      {
        ...getDetails('quran-radio'),
        step: {
          ...commonStepOptions,
          target: '#radio-button',
          showSkipButton: true,
          placement: 'bottom',
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
          showSkipButton: true,
          spotlightClicks: true,
          placement: 'bottom',
        },
      },
      {
        ...getDetails('theme'),
        step: {
          ...commonStepOptions,
          target: '#theme-section',
          spotlightClicks: true,
          placement: 'left-start',
        },
      },
      {
        ...getDetails('font-style'),
        step: {
          ...commonStepOptions,
          target: '#quran-font-section',
          spotlightClicks: true,
          placement: getResponsivePlacement('left-start', isDeviceMobile),
          disableScrolling: false,
          disableOverlay: shouldDisableOverlay,
        },
      },
      {
        ...getDetails('font-size'),
        step: {
          ...commonStepOptions,
          target: '#font-size-section',
          spotlightClicks: true,
          placement: 'left-start',
        },
      },
      {
        ...getDetails('wbw-translation'),
        step: {
          ...commonStepOptions,
          target: '#wbw-translation-section',
          spotlightClicks: true,
          placement: 'left-start',
        },
      },
      {
        ...getDetails('wbw-transliteration'),
        step: {
          ...commonStepOptions,
          target: '#wbw-transliteration-section',
          spotlightClicks: true,
          placement: 'left-start',
        },
      },
      {
        ...getDetails('wbw-audio'),
        step: {
          ...commonStepOptions,
          target: '#wbw-recitation-section',
          spotlightClicks: true,
          placement: 'left-start',
        },
      },
      {
        ...getDetails('inline-wbw'),
        step: {
          ...commonStepOptions,
          target: '#wbw-display-section',
          spotlightClicks: true,
          placement: 'left-start',
        },
      },
      {
        ...getDetails('translations'),
        step: {
          ...commonStepOptions,
          target: '#translation-section',
          placement: 'left-start',
          spotlightClicks: true,
          disableScrolling: false,
        },
      },
      {
        ...getDetails('translations'),
        step: {
          ...commonStepOptions,
          target: '#settings-drawer-body',
          placement: getResponsivePlacement('left-start', isDeviceMobile),
          spotlightClicks: true,
          disableOverlay: shouldDisableOverlay,
        },
      },
    ],
    [OnboardingGroup.READING_EXPERIENCE]: [
      {
        ...getDetails('surah-info'),
        step: {
          ...commonStepOptions,
          target: '#surah-info-button',
          placement: 'bottom',
          showSkipButton: true,
        },
      },
      {
        ...getDetails('listen'),
        step: {
          ...commonStepOptions,
          target: '#play-verse-button',
          spotlightClicks: true,
          showNextButton: true,
        },
      },
      {
        ...getDetails('select-reciter'),
        step: {
          ...commonStepOptions,
          target: '#audio-player-overflow-menu-trigger',
          spotlightClicks: true,
          disableScrolling: true,
        },
      },
      {
        ...getDetails('select-reciter'),
        step: {
          ...commonStepOptions,
          target: '#audio-player-overflow-menu-reciter',
          placement: 'left',
          spotlightClicks: true,
          disableScrolling: true,
        },
      },
      {
        ...getDetails('select-reciter'),
        step: {
          ...commonStepOptions,
          target: '#audio-player-reciter-list',
          spotlightClicks: true,
          placement: getResponsivePlacement('right', isDeviceMobile),
          disableScrolling: false,
          disableOverlay: shouldDisableOverlay,
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
          placement: 'bottom',
        },
      },
      {
        ...getDetails('streak'),
        step: {
          ...commonStepOptions,
          target: '#qgj-widget',
        },
      },
      {
        ...getDetails('reading-sessions'),
        step: {
          ...commonStepOptions,
          target: '#reading-sessions',
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
    href: '/',
  },
];
