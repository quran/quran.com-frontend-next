import React from 'react';
import Button, { ButtonSizes } from './Button';
import IconLogo from '../../../../public/icons/Logo.svg';

export default {
  title: 'dls|Buttons',
};
export const IconButton = () => <Button icon={<IconLogo />} size={ButtonSizes.Medium} />;
