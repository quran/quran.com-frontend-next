import React from 'react';
import Card from './Card';
import image from '../../../../public/images/sunnah.png';

export default {
  title: 'dls|Cards',
};

export const normal = () => <Card title="Title" subtitle="Subtitle" image={image} />;
