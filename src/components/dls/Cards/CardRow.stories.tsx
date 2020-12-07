import React from 'react';
import CardRow from './CardRow';
import Card from './Card';

export default {
  title: 'dls|CardRow',
};

export const normal = () => (
  <CardRow>
    <Card title="Title" subtitle="Subtitle" image="/sample-image.png" />
    <Card title="Title" subtitle="Subtitle" image="/sample-image.png" />
    <Card title="Title" subtitle="Subtitle" image="/sample-image.png" />
  </CardRow>
);
