import React from 'react';
import CardRow from './CardRow';
import Card from './Card';
import image from '../../../../public/images/sunnah.png';

export default {
  title: 'dls|CardRow',
};

export const normal = () => (
  <CardRow>
    <Card title="Title" subtitle="Subtitle" image={image} />
    <Card title="Title" subtitle="Subtitle" image={image} />
    <Card title="Title" subtitle="Subtitle" image={image} />
  </CardRow>
);
