import React from 'react';
import Text from './Text';

export default {
  title: 'dls|Text',
};

export const normal = () => <Text>Hello there</Text>;

export const primaryColor = () => <Text primary>Hello there</Text>;

export const smallSize = () => <Text small>Hello there</Text>;

export const miniSize = () => <Text mini>Hello there</Text>;
