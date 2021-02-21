import React from 'react';
import Button, { ButtonSize } from 'src/components/dls/Button/Button';
import { selectNavbar, setIsSideMenuOpen } from 'src/redux/slices/navbar';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { NAVBAR_HEIGHT, SIDE_MENU_DESKTOP_WIDTH } from 'src/styles/constants';
import { CenterVertically, CENTER_VERTICALLY } from 'src/styles/utility';
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

const SideMenu = () => {
  const isOpen = useSelector(selectNavbar).isSideMenuOpen;
  const dispatch = useDispatch();

  const closeSideMenu = () => {
    dispatch({ type: setIsSideMenuOpen.type, payload: false });
  };

  return (
    <NoOverFlow>
      {isOpen && (
        <div>
          <Container>
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
              <SideMenuItem title="Home" icon={<IconHome />} />
              <SideMenuItem title="About us" icon={<IconInfo />} />
              <SideMenuItem title="Updates" icon={<IconUpdates />} />
              <SideMenuItem title="Developers" icon={<IconDevelopers />} />
              <SideMenuItem title="Contribute" icon={<IconDonate />} />
              <SideMenuItem title="Privacy" icon={<IconLock />} />
              <SideMenuItem title="Help & Feedback" icon={<IconFeedback />} />
              <SideMenuItem title="Quran Radio" icon={<IconRadio2 />} />
              <SubTitle>Selected Collections</SubTitle>
              <SideMenuItem title="Duaas" icon={<IconCollection />} />
              <SideMenuItem title="Jewels of Quran" icon={<IconCollection />} />
              <SideMenuItem title="Names of Allah" icon={<IconCollection />} />
              <SideMenuItem title="Revelation" icon={<IconCollection />} />
              <SubTitle>Network</SubTitle>
              <SideMenuItem title="Quranicaudio.com" icon={<IconQ />} isExternalLink />
              <SideMenuItem title="Salah.com" icon={<IconQ />} isExternalLink />
              <SideMenuItem title="Sunnah.com" icon={<IconQ />} isExternalLink />
              <SideMenuItem title="Legacy.quran.com" icon={<IconQ />} isExternalLink />
              <SideMenuItem title="Corpus.quran.com" icon={<IconQ />} isExternalLink />
            </ListItemsContainer>
          </Container>
        </div>
      )}
    </NoOverFlow>
  );
};

const NoOverFlow = styled.div`
  overflow: hidden;
`;
const Container = styled.div`
  background: ${(props) => props.theme.colors.background.default};
  position: fixed;
  overflow-y: auto;
  height: 100vh;
  width: 100%;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: ${(props) => props.theme.zIndexes.header};

  @media only screen and (min-width: ${(props) => props.theme.breakpoints.tablet}) {
    width: ${SIDE_MENU_DESKTOP_WIDTH};
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
