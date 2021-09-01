import React from 'react';
import Button, { ButtonShape, ButtonVariant } from 'src/components/dls/Button/Button';
import IconSearch from '../../../../../public/icons/search.svg';

interface Props {
  disabled: boolean;
  href: string;
}

const DrawerSearchButton: React.FC<Props> = ({ disabled, href }) => (
  <Button
    tooltip="Search"
    shape={ButtonShape.Circle}
    variant={ButtonVariant.Ghost}
    disabled={disabled}
    href={href}
  >
    <IconSearch />
  </Button>
);

export default DrawerSearchButton;
