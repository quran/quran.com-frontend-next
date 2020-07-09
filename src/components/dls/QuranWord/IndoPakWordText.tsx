import React from 'react';

type IndoPakWordTextProps = {
  text: string;
};

const IndoPakWordText = (props: IndoPakWordTextProps) => {
  const { text } = props;
  return <span>{text}</span>;
};

export default IndoPakWordText;
