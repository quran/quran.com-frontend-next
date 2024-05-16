import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Provider } from 'react-redux';

import QuranWord from './QuranWord';

import getStore from '@/redux/store';
import { AudioPlayerMachineProvider } from '@/xstate/AudioPlayerMachineContext';
import { mockWord } from 'tests/mocks/words';
import { QuranFont } from 'types/QuranReader';
// @ts-ignore
import Word from 'types/Word';

export default {
  title: 'dls/QuranWord',
  component: QuranWord,
  args: {
    // @ts-ignore
    word: Word,
    font: QuranFont.QPCHafs,
    key: '1:1:2',
  },
  argTypes: {
    font: {
      table: {
        category: 'Optional',
      },
    },
    isHighlighted: {
      control: {
        type: 'boolean',
      },
      defaultValue: false,
      table: {
        category: 'Optional',
      },
    },
    isWordByWordAllowed: {
      control: {
        type: 'boolean',
      },
      defaultValue: false,
      table: {
        category: 'Optional',
      },
    },
    isAudioHighlightingAllowed: {
      control: {
        type: 'boolean',
      },
      defaultValue: false,
      table: {
        category: 'Optional',
      },
    },
    word: {
      table: {
        category: 'Required',
      },
    },
    isFontLoaded: {
      control: {
        type: 'boolean',
      },
      defaultValue: false,
      table: {
        category: 'Optional',
      },
    },
  },
};

const Template = (args) => (
  <TooltipProvider>
    <AudioPlayerMachineProvider>
      <Provider store={getStore('en')}>
        <span className="previewWrapper" style={{ direction: 'rtl' }}>
          <QuranWord {...args} />
        </span>
      </Provider>
    </AudioPlayerMachineProvider>
  </TooltipProvider>
);

export const WithQPCUthmaniText = Template.bind({});
WithQPCUthmaniText.args = {
  word: mockWord({ text: 'ٱللَّهِ' }),
  key: '1:1:2',
  font: QuranFont.QPCHafs,
};

export const WithUthmaniText = Template.bind({});
WithUthmaniText.args = {
  word: mockWord({ text: 'ٱللَّهِ' }),
  key: '1:1:2',
  font: QuranFont.Uthmani,
};

export const WithIndopakText = Template.bind({});
WithIndopakText.args = {
  word: mockWord({ text: 'اللهِ' }),
  key: '1:1:2',
  font: QuranFont.IndoPak,
};

export const WithQPCV1Text = Template.bind({});
WithQPCV1Text.args = {
  word: mockWord({ text: 'ﭒ' }),
  key: '1:1:2',
  font: QuranFont.MadaniV1,
};

export const WithQPCV2Text = Template.bind({});
WithQPCV2Text.args = {
  word: mockWord({ text: 'ﱂ' }),
  key: '1:1:2',
  font: QuranFont.MadaniV2,
};

export const WithTajweedImages = Template.bind({});
WithTajweedImages.args = {
  word: mockWord({ text: 'w/rq-color/1/1/2.png' }),
  key: '1:1:2',
  font: QuranFont.Tajweed,
};
