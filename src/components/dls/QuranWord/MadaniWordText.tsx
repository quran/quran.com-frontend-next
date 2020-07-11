import React from 'react';

type MadaniWordTextProps = {
  text: string;
};

const MadaniWordText = (props: MadaniWordTextProps) => {
  const { text } = props;
  return <span>{`${text} `}</span>;
};

export default MadaniWordText;
