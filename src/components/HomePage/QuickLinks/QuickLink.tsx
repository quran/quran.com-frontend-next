import React from 'react';

import Button, { ButtonShape, ButtonSize, ButtonType, ButtonVariant } from '@/dls/Button/Button';
import { logButtonClick } from '@/utils/eventLogger';

interface Props {
  slug: string;
  text: string;
  logKey: string;
  className?: string;
  isExternalLink?: boolean;
}

const QuickLink: React.FC<Props> = ({ text, slug, className, logKey, isExternalLink = false }) => (
  <Button
    size={ButtonSize.Small}
    className={className}
    href={isExternalLink ? slug : `/${slug}`}
    type={ButtonType.Secondary}
    variant={ButtonVariant.Compact}
    shape={ButtonShape.Pill}
    onClick={() => {
      logButtonClick(`quick_link_${logKey}`);
    }}
    {...(isExternalLink && { isNewTab: true })}
  >
    {text}
  </Button>
);

export default QuickLink;
