/* eslint-disable react/no-multi-comp */
import React, { useState } from 'react';

import Tabs from './Tabs';

import LinkIcon from '@/icons/QR.svg';
import ShareIcon from '@/icons/share.svg';

export default {
  title: 'dls/Tabs/New',
  component: Tabs,
};

const TranslationBody = () => <div>Translation</div>;
const ReadingBody = () => <div>Reading</div>;
const TafsirBody = () => <div>Tafisr</div>;

const DEFAULT_TABS = [
  { title: 'Translation', value: 'translation', body: <TranslationBody /> },
  { title: 'Reading', value: 'reading', body: <ReadingBody /> },
  { title: 'Tafsir', value: 'tafsir', body: <TafsirBody /> },
];

export const Default = (args) => {
  const [selected, setSelected] = useState('translation');

  return (
    <span className="previewWrapper">
      <Tabs tabs={DEFAULT_TABS} value={selected} onValueChange={setSelected} {...args} />
    </span>
  );
};

const WITH_DEFAULT_TABS = [
  { title: 'Translation', value: 'translation', body: <TranslationBody />, icon: <LinkIcon /> },
  { title: 'Reading', value: 'reading', body: <ReadingBody />, icon: <ShareIcon /> },
];

export const WithIcon = (args) => {
  return (
    <span className="previewWrapper">
      <Tabs defaultValue="translation" tabs={WITH_DEFAULT_TABS} {...args} />
    </span>
  );
};
