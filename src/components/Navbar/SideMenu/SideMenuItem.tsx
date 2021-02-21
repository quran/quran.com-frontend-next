import React from 'react';
import IconContainer, { IconColor, IconSize } from 'src/components/dls/IconContainer/IconContainer';
import { CENTER_VERTICALLY } from 'src/styles/utility';
import styled from 'styled-components';
import IconNorthEast from '../../../../public/icons/north_east.svg';

type SideMenuItemProps = {
  title?: string;
  icon?: React.ReactNode;
  isExternalLink?: boolean;
};
const SideMenuItem = ({ title, icon, isExternalLink }: SideMenuItemProps) => {
  return (
    <Container>
      <InnerContainer>
        <div>
          <IconContainer icon={icon} size={IconSize.Xsmall} color={IconColor.secondary} />
          <TitleContainer>{title}</TitleContainer>
        </div>
        <div>
          {isExternalLink && (
            <IconContainer
              icon={<IconNorthEast />}
              size={IconSize.Xsmall}
              color={IconColor.secondary}
            />
          )}
        </div>
      </InnerContainer>
    </Container>
  );
};

const Container = styled.div`
  ${CENTER_VERTICALLY}
  min-height: calc(${(props) => `${props.theme.spacing.mega} + ${props.theme.spacing.small}`});
  padding-left: ${(props) => props.theme.spacing.micro};
  padding-right: ${(props) => props.theme.spacing.micro};
  border-bottom: 1px ${(props) => props.theme.colors.borders.hairline} solid;
`;

const InnerContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const TitleContainer = styled.span`
  margin-left: ${(props) => props.theme.spacing.medium};
  font-size: ${(props) => props.theme.fontSizes.xlarge};
  vertical-align: text-top;
`;
export default SideMenuItem;
