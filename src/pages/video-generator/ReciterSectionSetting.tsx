/* eslint-disable react/no-multi-comp */
import React from 'react';

import dynamic from 'next/dynamic';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import styles from './video.module.scss';

import Drawer, { DrawerType } from '@/components/Navbar/Drawer';
import Button, { ButtonVariant } from '@/dls/Button/Button';
import BackIcon from '@/icons/west.svg';
import { selectNavbar, setSettingsView, SettingsView } from '@/redux/slices/navbar';
import { logValueChange } from '@/utils/eventLogger';
import SettingsBodySkeleton from '@/components/Navbar/SettingsDrawer/SettingsBodySkeleton';
import Section from '@/components/Navbar/SettingsDrawer/Section';
import { GetStaticProps } from 'next/types';
import { getAvailableReciters } from '@/api';
import { getAllChaptersData } from '@/utils/chapter';
const SettingsBody = dynamic(() => import('@/components/Navbar/SettingsDrawer/SettingsBody'), {
  ssr: false,
  loading: () => <SettingsBodySkeleton />,
});

const ReciterSelectionBody = dynamic(() => import('@/components/Navbar/SettingsDrawer/ReciterSelectionBody'), {
  ssr: false,
});


const SettingsDrawer = ({ reciters }) => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const { isSettingsDrawerOpen, settingsView } = useSelector(selectNavbar);
  return (
    <Section>
        <Section.Row>
            Hello World
        </Section.Row>
    </Section>
  );
};

export default SettingsDrawer;
