import React from 'react';
import Button, { ButtonSizes } from './Button';

export default {
  title: 'dls|Buttons',
};
export const IconButton = () => (
  <Button iconHref="/icons/Logo.svg" size={ButtonSizes.Medium} iconAlt="logo" />
);
