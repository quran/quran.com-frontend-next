import React from 'react';
import CardRow from './CardRow';
import Card from './Card';

export default {
  title: 'dls|CardRow',
};

export const normal = () => (
  <CardRow>
    <Card
      title="Title"
      subtitle="Subtitle"
      image="https://cdn.qurancdn.com/packs/media/images/salah-935518782bf136f39dc70621fd40ea31.jpg"
    />
    <Card
      title="Title"
      subtitle="Subtitle"
      image="https://cdn.qurancdn.com/packs/media/images/salah-935518782bf136f39dc70621fd40ea31.jpg"
    />
    <Card
      title="Title"
      subtitle="Subtitle"
      image="https://cdn.qurancdn.com/packs/media/images/salah-935518782bf136f39dc70621fd40ea31.jpg"
    />
  </CardRow>
);
