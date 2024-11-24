import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import { CourseEditor } from '@/types/auth/Course';

type Props = {
  editors: { editor: CourseEditor }[];
};

const EditorsDetails: React.FC<Props> = ({ editors }) => {
  const { t } = useTranslation('common');
  const editorNames = editors.map((author) => author.editor.name);

  let displayNames;
  if (editorNames.length === 1) {
    displayNames = editorNames[0];
  } else if (editorNames.length >= 2) {
    // Take all names except the last one and join them with commas
    const namesExceptLast = editorNames.slice(0, -1).join(', ');
    // Add the last name with 'and'
    displayNames = `${namesExceptLast} ${t('and')} ${editorNames[editorNames.length - 1]}`;
  }
  return <span>{displayNames}</span>;
};

export default EditorsDetails;
