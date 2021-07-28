import React from 'react';
import Tabs from './Tabs';
import Card from '../Cards/Card';

export default {
  title: 'dls|Tabs',
};

export const normal = () => (
  <Tabs>
    <Card title="Title1" subtitle="Subtitle" image="https://dummyimage.com/512x512" />
    <Card title="Title2" subtitle="Subtitle" image="https://dummyimage.com/512x512" />
    <Card title="Title3" subtitle="Subtitle" image="https://dummyimage.com/512x512" />
  </Tabs>
);
