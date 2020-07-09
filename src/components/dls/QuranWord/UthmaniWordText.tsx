import React from 'react';

type UthmaniWordTextProps = {
  code: string;
  pageNumber: number;
  wordId?: number;
};

const UthmaniWordText = (props: UthmaniWordTextProps) => {
  const { code, pageNumber } = props;

  // eslint-disable-next-line react/no-danger
  return (
    <span style={{ fontFamily: `p${pageNumber}` }} dangerouslySetInnerHTML={{ __html: code }} />
  ); // Eslint
};

export default UthmaniWordText;
