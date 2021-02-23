import Link from 'next/link';
import React from 'react';
import IconContainer, { IconColor, IconSize } from 'src/components/dls/IconContainer/IconContainer';
import { CENTER_VERTICALLY } from 'src/styles/utility';
import styled from 'styled-components';
import IconNorthEast from '../../../../public/icons/north_east.svg';

type SideMenuItemProps = {
  title?: string;
  icon?: React.ReactNode;
  isExternalLink?: boolean;
  href?: string;
  isStale?: boolean;
};

const SideMenuItem = ({
  title,
  icon,
  isExternalLink,
  href,
  isStale = false,
}: SideMenuItemProps) => {
  const isLink = !!href;
  return (
    <LinkContainer href={href} isExternalLink={isExternalLink}>
      <Container isLink={isLink} isStale={isStale}>
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
    </LinkContainer>
  );
};

type LinkContainerProps = {
  href?: string;
  isExternalLink?: boolean;
  children: React.ReactNode;
};

const LinkContainer = ({ href, isExternalLink, children }: LinkContainerProps) => {
  if (!href) {
    return <>{children}</>;
  }
  if (isExternalLink) {
    return (
      <A href={href} target="_blank" rel="noreferrer">
        {children}
      </A>
    );
  }
  return (
    <Link href={href} passHref>
      <A>{children}</A>
    </Link>
  );
};

const Container = styled.div<{ isLink: boolean; isStale: boolean }>`
  ${CENTER_VERTICALLY}
  min-height: calc(${(props) => `${props.theme.spacing.mega} + ${props.theme.spacing.small}`});
  padding-left: ${(props) => props.theme.spacing.micro};
  padding-right: ${(props) => props.theme.spacing.micro};
  border-bottom: 1px ${(props) => props.theme.colors.borders.hairline} solid;

  ${(props) =>
    !props.isStale &&
    `&:hover {
    background: #f9fcff;
  }`}
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

const A = styled.a`
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  &:hover {
    color: #0057ff;

    path {
      fill: #0057ff;
    }
  }
`;

export default SideMenuItem;
