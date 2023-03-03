import React from 'react';

import Button, { ButtonShape, ButtonSize, ButtonType } from '@/dls/Button/Button';
import { logButtonClick } from '@/utils/eventLogger';

interface Props {
  slug: string;
  text: string;
  logKey: string;
  className?: string;
}

const QuickLink: React.FC<Props> = ({ text, slug, className, logKey }) => (
  <Button
    size={ButtonSize.Small}
    className={className}
    href={`/${slug}`}
    type={ButtonType.Secondary}
    shape={ButtonShape.Pill}
    onClick={() => {
      logButtonClick(`quick_link_${logKey}`);
    }}
  >
    {text}
  </Button>
);

export default QuickLink;
