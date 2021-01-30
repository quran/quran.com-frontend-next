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
  border-radius: ${(props) => props.theme.borderRadiuses.default};
  width: 100%;
  white-space: normal;
  scroll-snap-align: center;
  margin: 0;
  overflow: hidden;
  height: calc(6 * ${(props) => props.theme.spacing.mega});
`;

const StyledImage = styled(Image)`
  max-width: 100%;
  height: auto;
  border-radius: ${(props) => props.theme.borderRadiuses.default};
  width: 100%;
`;

const Caption = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: ${(props) => rgba(props.theme.colors.primary.medium, 0.7)};
  border-radius: ${(props) => props.theme.borderRadiuses.default};
  font-family: SFProText-Regular;
  font-size: ${(props) => props.theme.fontSizes.xlarge};
  color: ${(props) => props.theme.colors.text.link};
  padding: ${(props) => props.theme.spacing.medium} ${(props) => props.theme.spacing.mega};
  align-items: flex-end;
  display: flex;
`;

const Title = styled.h3`
  font-family: SFProText-Regular;
  font-size: calc(2 * ${(props) => props.theme.fontSizes.large});
  color: #fff;
  margin-bottom: ${(props) => props.theme.spacing.xxsmall};
`;

export default Card;
