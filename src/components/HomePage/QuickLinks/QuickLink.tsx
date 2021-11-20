import React from 'react';

import Button, { ButtonShape, ButtonType } from 'src/components/dls/Button/Button';

interface Props {
  slug: string;
  text: string;
  className?: string;
}

const QuickLink: React.FC<Props> = ({ text, slug, className }) => (
  <Button
    className={className}
    href={`/${slug}`}
    type={ButtonType.Success}
    shape={ButtonShape.Pill}
  >
    {text}
  </Button>
);

export default QuickLink;
