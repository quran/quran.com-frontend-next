import React from 'react';
import styled from 'styled-components';
import { rgba } from 'polished';
import Image from 'next/image';

type CardProps = {
  title: string;
  subtitle: string;
  image: string;
};

const DIMENSIONS = {
  WIDTH: 360,
  HEIGHT: 180,
};

const Card = ({ title, subtitle, image }: CardProps) => (
  <CardContainer>
    <StyledImage
      src={image}
      role="presentation"
      alt={title}
      width={DIMENSIONS.WIDTH}
      height={DIMENSIONS.HEIGHT}
    />
    <Caption>
      <div>
        <Title>{title}</Title>
        <p>{subtitle}</p>
      </div>
    </Caption>
  </CardContainer>
);

const CardContainer = styled.figure`
  position: relative;
  border-radius: 10px;
  width: 100%;
  white-space: normal;
  scroll-snap-align: center;
  margin: 0px;
  overflow: hidden;
  height: 180px;
`;

const StyledImage = styled(Image)`
  max-width: 100%;
  height: auto;
  border-radius: 10px;
  width: 100%;
`;

const Caption = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: ${(props) => rgba(props.theme.colors.primary.medium, 0.7)};
  border-radius: 10px;
  font-family: SFProText-Regular;
  font-size: 16px;
  color: #fff;
  padding: 16px 30px;
  align-items: flex-end;
  display: flex;
`;

const Title = styled.h3`
  font-family: SFProText-Regular;
  font-size: 26px;
  color: #fff;
  margin-bottom: 7px;
`;

export default Card;
