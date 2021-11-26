import React from 'react';

import Button, { ButtonShape, ButtonSize, ButtonType } from 'src/components/dls/Button/Button';

interface Props {
  slug: string;
  text: string;
  className?: string;
}

const QuickLink: React.FC<Props> = ({ text, slug, className }) => (
  <Button
    size={ButtonSize.Small}
    className={className}
    href={`/${slug}`}
    type={ButtonType.Secondary}
    shape={ButtonShape.Pill}
  >
    {text}
  </Button>
);

export default QuickLink;
