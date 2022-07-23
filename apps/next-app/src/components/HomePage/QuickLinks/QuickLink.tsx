import React from 'react';

import Button, { ButtonShape, ButtonSize, ButtonType } from 'src/components/dls/Button/Button';
import { logButtonClick } from 'src/utils/eventLogger';

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
    onClick={() => {
      logButtonClick(`quick_link_${slug}`);
    }}
  >
    {text}
  </Button>
);

export default QuickLink;
