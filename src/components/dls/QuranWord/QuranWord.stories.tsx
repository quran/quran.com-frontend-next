import { Provider } from 'react-redux';

import QuranWord from './QuranWord';

import getStore from 'src/redux/store';
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
  argTypes: {},
};

const Template = (args) => (
  <Provider store={getStore('en')}>
    <QuranWord {...args} />
  </Provider>
);

export const withQPCUthmaniText = Template.bind({});
withQPCUthmaniText.args = {
  word: mockWord({ text: 'ٱللَّهِ' }),
  key: '1:1:2',
  font: QuranFont.QPCHafs,
};

export const withUthmaniText = Template.bind({});
withUthmaniText.args = {
  word: mockWord({ text: 'ٱللَّهِ' }),
  key: '1:1:2',
  font: QuranFont.Uthmani,
};

export const withIndopakText = Template.bind({});
withIndopakText.args = {
  word: mockWord({ text: 'اللهِ' }),
  key: '1:1:2',
  font: QuranFont.IndoPak,
};

export const withQPCV1Text = Template.bind({});
withQPCV1Text.args = {
  word: mockWord({ text: 'ﭒ' }),
  key: '1:1:2',
  font: QuranFont.MadaniV1,
};

export const withQPCV2Text = Template.bind({});
withQPCV2Text.args = {
  word: mockWord({ text: 'ﱂ' }),
  key: '1:1:2',
  font: QuranFont.MadaniV2,
};

export const withTajweedImages = Template.bind({});
withTajweedImages.args = {
  word: mockWord({ text: 'w/rq-color/1/1/2.png' }),
  key: '1:1:2',
  font: QuranFont.Tajweed,
};
