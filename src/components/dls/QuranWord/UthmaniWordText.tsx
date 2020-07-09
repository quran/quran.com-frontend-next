import React from 'react';

type UthmaniWordTextProps = {
  code: string;
  pageNumber: number;
  wordId?: number;
};

const UthmaniWordText = (props: UthmaniWordTextProps) => {
  const { code } = props;
  return <div className={code} />;
};

export default UthmaniWordText;
