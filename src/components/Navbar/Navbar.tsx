import React from 'react';
import { NAVBAR_HEIGHT } from 'src/styles/constants';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { selectNavbar, setIsSideMenuOpen } from 'src/redux/slices/navbar';
import { CenterVertically } from 'src/styles/utility';
import Link from 'next/link';
import Button, { ButtonSize } from '../dls/Button/Button';
import LanuageSelector from './LanguageSelector';
import IconSettings from '../../../public/icons/settings.svg';
import IconReader from '../../../public/icons/reader.svg';
import IconSearch from '../../../public/icons/search.svg';
import IconMenu from '../../../public/icons/menu.svg';
import IconQ from '../../../public/icons/Q.svg';
import SideMenu from './SideMenu/SideMenu';

const Navbar = () => {
  const { isVisible } = useSelector(selectNavbar);

  const dispatch = useDispatch();

  const openSideMenu = () => {
    dispatch({ type: setIsSideMenuOpen.type, payload: true });
  };

  return (
    <StyledNav isVisible={isVisible}>
      {isVisible && (
        <StyledItemsContainer>
          <CenterVertically>
            <LeftCTA>
              <SideMenu />
              <Button icon={<IconMenu />} size={ButtonSize.Small} onClick={openSideMenu} />
              <Link href="/">
                <a>
                  <Button icon={<IconQ />} size={ButtonSize.Small} />
                </a>
              </Link>
              <LanuageSelector />
            </LeftCTA>
          </CenterVertically>
          <CenterVertically>
            <RightCTA>
              <Button icon={<IconSettings />} size={ButtonSize.Small} />
              <Button icon={<IconReader />} size={ButtonSize.Small} />
              <Button icon={<IconSearch />} size={ButtonSize.Small} />
            </RightCTA>
          </CenterVertically>
        </StyledItemsContainer>
      )}
    </StyledNav>
  );
};

const StyledNav = styled.nav<{ isVisible: boolean }>`
  position: fixed;
  height: ${NAVBAR_HEIGHT};
  ${(props) => !props.isVisible && `transform: translateY(-${NAVBAR_HEIGHT});`}
  width: 100%;
  transition: ${(props) => props.theme.transitions.regular};
  background: ${(props) => props.theme.colors.background.default};
  z-index: ${(props) => props.theme.zIndexes.header};
  border-bottom: 1px ${(props) => props.theme.colors.borders.hairline} solid;
`;

const StyledItemsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  height: 100%;
`;

const LeftCTA = styled.div`
  display: flex;
  margin-left: ${(props) => props.theme.spacing.medium};

  @media only screen and (min-width: ${(props) => props.theme.breakpoints.tablet}) {
    margin-left: ${(props) => `calc(1*${props.theme.spacing.mega})`};
  }
`;
const RightCTA = styled.div`
  display: flex;
  margin-right: ${(props) => props.theme.spacing.medium};

  > button {
    margin-left: ${(props) => props.theme.spacing.micro};
  }

  @media only screen and (min-width: ${(props) => props.theme.breakpoints.tablet}) {
    margin-right: ${(props) => `calc(1*${props.theme.spacing.mega})`};

    > button {
      margin-left: ${(props) => props.theme.spacing.xsmall};
    }
  }
`;

export default Navbar;
