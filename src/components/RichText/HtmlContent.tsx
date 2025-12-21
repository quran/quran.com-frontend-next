import React from 'react';

import styles from '@/components/MarkdownEditor/MarkdownEditor.module.scss';

interface HtmlContentProps {
  html: string;
  className?: string;
}

const HtmlContent: React.FC<HtmlContentProps> = ({ html, className }) => (
  <div
    className={className || styles.editor}
    suppressHydrationWarning
    // eslint-disable-next-line react/no-danger
    dangerouslySetInnerHTML={{ __html: html || '' }}
  />
);

export default HtmlContent;
