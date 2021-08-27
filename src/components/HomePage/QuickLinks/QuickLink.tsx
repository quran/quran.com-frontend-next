import React from 'react';
import Button, { ButtonType, ButtonVariant } from 'src/components/dls/Button/Button';

interface Props {
  slug: string;
  text: string;
}

const QuickLink: React.FC<Props> = ({ text, slug }) => (
  <Button href={`/${slug}`} variant={ButtonVariant.Shadow} type={ButtonType.Secondary}>
    {text}
  </Button>
);

export default QuickLink;
