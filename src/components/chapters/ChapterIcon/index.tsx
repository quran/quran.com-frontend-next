import React from 'react';

interface Props {
  id?: string;
}

const ChapterIcon: React.FC<Props> = ({ id }) => <span translate="no">{id.padStart(3, '0')}</span>;

export default ChapterIcon;
