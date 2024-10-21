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
  } else if (editorNames.length === 2) {
    displayNames = `${editorNames[0]} ${t('and')} ${editorNames[1]}`;
  } else if (editorNames.length >= 3) {
    displayNames = `${editorNames[0]}, ${editorNames[1]} ${t('and')} ${editorNames[2]}`;
  }
  return <span>{displayNames}</span>;
};

export default EditorsDetails;
