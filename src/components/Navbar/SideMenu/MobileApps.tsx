import React from 'react';
import styled from 'styled-components';
import Image from 'next/image';
import { CenterHorizontally } from 'src/styles/utility';
import SideMenuItem from './SideMenuItem';
import IconMobile from '../../../../public/icons/mobile.svg';

const IMAGES_CONTAINER_WIDTH = '17rem';

const MobileApps = () => {
  return (
    <Container>
      <SideMenuItem title="Mobile Apps" icon={<IconMobile />} />
      <CenterHorizontally>
        <ImagesContainer>
          <a
            href="https://itunes.apple.com/us/app/quran-by-quran.com-qran/id1118663303"
            target="_blank"
            rel="noreferrer"
          >
            <Image src="/images/app-store.svg" width={135} height={40} />
          </a>
          <a
            href="https://play.google.com/store/apps/details?id=com.quran.labs.androidquran&utm_source=quran-com&utm_campaign=download"
            target="_blank"
            rel="noreferrer"
          >
            <Image src="/images/play-store.svg" width={120} height={40} />
          </a>
        </ImagesContainer>
      </CenterHorizontally>
    </Container>
  );
};

const Container = styled.div`
  background: ${(props) => props.theme.colors.background.fadedGreyScale};
`;

const ImagesContainer = styled.div`
  display: flex;
  max-width: ${IMAGES_CONTAINER_WIDTH};
  justify-content: space-between;
  margin: auto;
  padding-top: ${(props) => props.theme.spacing.xxsmall};
  padding-bottom: ${(props) => props.theme.spacing.mega};
`;

export default MobileApps;
