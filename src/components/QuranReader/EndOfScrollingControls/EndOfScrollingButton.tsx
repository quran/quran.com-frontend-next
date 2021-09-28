import React from 'react';

import Button, { ButtonType } from 'src/components/dls/Button/Button';

interface Props {
  onClick?: () => void;
  href?: string;
  text: string;
}

const EndOfScrollingButton: React.FC<Props> = ({ text, href, onClick }) => {
  return (
    <Button type={ButtonType.Secondary} {...(onClick && { onClick })} {...(href && { href })}>
      {text}
    </Button>
  );
};

export default EndOfScrollingButton;
