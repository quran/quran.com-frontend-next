import React from 'react';
import styled from 'styled-components';

const Image = styled.img`
  @media (max-width: 375px) {
    &:last-child {
      margin-top: 15px;
    }
  }
`;

type DownloadProps = {
  url: string;
  src: string;
  alt: string;
  width: string;
  height: string;
};
const DownloadAppButton = ({ url, src, alt, width, height }: DownloadProps) => (
  <a href={url} target="_blank" rel="noreferrer">
    <Image src={src} alt={alt} width={width} height={height} />
  </a>
);

export default DownloadAppButton;
