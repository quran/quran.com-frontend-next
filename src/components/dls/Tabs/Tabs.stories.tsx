import React from 'react';
import Tabs from './Tabs';
import Card from '../Cards/Card';

export default {
  title: 'dls|Tabs',
};

export const normal = () => (
  <Tabs>
    <Card
      title="Title1"
      subtitle="Subtitle"
      image="https://cdn.qurancdn.com/packs/media/images/salah-935518782bf136f39dc70621fd40ea31.jpg"
    />
    <Card
      title="Title2"
      subtitle="Subtitle"
      image="https://cdn.qurancdn.com/packs/media/images/salah-935518782bf136f39dc70621fd40ea31.jpg"
    />
    <Card
      title="Title3"
      subtitle="Subtitle"
      image="https://cdn.qurancdn.com/packs/media/images/salah-935518782bf136f39dc70621fd40ea31.jpg"
    />
  </Tabs>
);
