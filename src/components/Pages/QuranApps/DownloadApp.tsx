import React from 'react';
// import Helmet from 'react-helmet';
// import Button from 'react-bootstrap/Button';

import styled from 'styled-components';

// const Container = styled.div`
//   min-height: 500px;
//   min-height: 100vh;
//   padding-top: 15%;
//
//   & + footer {
//     margin-top: 0;
//   }
// `;

const Image = styled.img`
  width: 130px;
  height: 35;
  @media (max-width: 375px) {
    &:last-child {
      margin-top: 15px;
    }
  }
`;

type DownloadProps = {
  alt: string;
  src: string;
};
const DownloadApp = ({ src, alt }: DownloadProps) => <Image src={src} alt={alt} />;

export default DownloadApp;
