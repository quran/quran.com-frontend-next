import React from 'react';
import Tabs from './Tabs';
import Card from '../Cards/Card';
import image from '../../../../public/images/sunnah.png';

export default {
  title: 'dls|Tabs',
};

export const normal = () => (
  <Tabs>
    <Card title="Title1" subtitle="Subtitle" image={image} />
    <Card title="Title2" subtitle="Subtitle" image={image} />
    <Card title="Title3" subtitle="Subtitle" image={image} />
  </Tabs>
);
