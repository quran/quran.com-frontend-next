import React, { useCallback, useEffect } from 'react';
import Button, { ButtonSize } from 'src/components/dls/Button/Button';
import { selectNavbar, setIsSideMenuOpen } from 'src/redux/slices/navbar';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { NAVBAR_HEIGHT, SIDE_MENU_DESKTOP_WIDTH } from 'src/styles/constants';
import { CenterVertically, CENTER_VERTICALLY } from 'src/styles/utility';
import { useRouter } from 'next/router';
import IconClose from '../../../../public/icons/close.svg';
import IconHome from '../../../../public/icons/home.svg';
import IconCollection from '../../../../public/icons/collection.svg';
import IconQ from '../../../../public/icons/Q.svg';
import IconInfo from '../../../../public/icons/info.svg';
import IconUpdates from '../../../../public/icons/updates.svg';
import IconDevelopers from '../../../../public/icons/developers.svg';
import IconDonate from '../../../../public/icons/donate.svg';
import IconLock from '../../../../public/icons/lock.svg';
import IconFeedback from '../../../../public/icons/feedback.svg';
import IconRadio2 from '../../../../public/icons/radio-2.svg';

import LanguageSelector from '../LanguageSelector';
import SideMenuItem from './SideMenuItem';
import MobileApps from './MobileApps';

const SideMenu = () => {
  const isOpen = useSelector(selectNavbar).isSideMenuOpen;
  const dispatch = useDispatch();
  const router = useRouter();

  const closeSideMenu = useCallback(() => {
    dispatch({ type: setIsSideMenuOpen.type, payload: false });
  }, [dispatch]);

  // Hide navbar after succesful navigation
  useEffect(() => {
    router.events.on('routeChangeComplete', () => {
      if (isOpen) {
        closeSideMenu();
      }
    });
  }, [closeSideMenu, router.events, isOpen]);

  return (
    <Container isOpen={isOpen}>
      <Header>
        <CenterVertically>
          <LeftCTA>
            <LanguageSelector />
          </LeftCTA>
        </CenterVertically>
        <CenterVertically>
          <RightCTA>
            <Button icon={<IconClose />} size={ButtonSize.Small} onClick={closeSideMenu} />
          </RightCTA>
        </CenterVertically>
      </Header>
      <ListItemsContainer>
        <SubTitle>Menu</SubTitle>
        <SideMenuItem title="Home" icon={<IconHome />} href="/" />
        <SideMenuItem title="About us" icon={<IconInfo />} href="/about" />
        <SideMenuItem title="Updates" icon={<IconUpdates />} href="/updates" />
        <SideMenuItem title="Developers" icon={<IconDevelopers />} href="/developers" />
        <SideMenuItem title="Contribute" icon={<IconDonate />} href="/contribute" />
        <SideMenuItem title="Privacy" icon={<IconLock />} href="/privacy" />
        <SideMenuItem title="Help & Feedback" icon={<IconFeedback />} href="/help" />
        <SideMenuItem title="Quran Radio" icon={<IconRadio2 />} />
        <SubTitle>Selected Collections</SubTitle>
        <SideMenuItem title="Duaas" icon={<IconCollection />} />
        <SideMenuItem title="Jewels of Quran" icon={<IconCollection />} />
        <SideMenuItem title="Names of Allah" icon={<IconCollection />} />
        <SideMenuItem title="Revelation" icon={<IconCollection />} />
        <SubTitle>Network</SubTitle>
        <SideMenuItem
          title="Quranicaudio.com"
          icon={<IconQ />}
          href="https://quranicaudio.com"
          isExternalLink
        />
        <SideMenuItem title="Salah.com" icon={<IconQ />} href="https://salah.com" isExternalLink />
        <SideMenuItem
          title="Sunnah.com"
          icon={<IconQ />}
          href="https://sunnah.com"
          isExternalLink
        />
        <SideMenuItem
          title="Legacy.quran.com"
          icon={<IconQ />}
          href="https://legacy.quran.com"
          isExternalLink
        />
        <SideMenuItem
          title="Corpus.quran.com"
          icon={<IconQ />}
          href="https://corpus.quran.com"
          isExternalLink
        />
        <MobileApps />
      </ListItemsContainer>
    </Container>
  );
};

const Container = styled.div<{ isOpen: boolean }>`
  background: ${(props) => props.theme.colors.background.default};
  position: fixed;
  height: 100vh;
  width: 100%;
  left: ${(props) => (props.isOpen ? 0 : '-100%')};
  top: 0;
  bottom: 0;
  z-index: ${(props) => props.theme.zIndexes.header};

  transition: ${(props) => props.theme.transitions.regular};

  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior-y: contain;

  @media only screen and (min-width: ${(props) => props.theme.breakpoints.tablet}) {
    width: ${SIDE_MENU_DESKTOP_WIDTH};
    left: ${(props) => (props.isOpen ? 0 : `-${SIDE_MENU_DESKTOP_WIDTH}`)};
  }
`;

const Header = styled.div`
  height: ${NAVBAR_HEIGHT};
  border-bottom: 1px ${(props) => props.theme.colors.borders.hairline} solid;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
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

const ListItemsContainer = styled.div`
  padding-left: ${(props) => props.theme.spacing.medium};
  padding-right: ${(props) => props.theme.spacing.medium};
`;

const SubTitle = styled.h3`
  ${CENTER_VERTICALLY}
  font-size: ${(props) => props.theme.fontSizes.large};
  text-transform: uppercase;
  font-weight: ${(props) => props.theme.fontWeights.bold};
  border-bottom: 1px ${(props) => props.theme.colors.borders.hairline} solid;
  min-height: calc(${(props) => `${props.theme.spacing.mega} + ${props.theme.spacing.small}`});
`;
export default SideMenu;
