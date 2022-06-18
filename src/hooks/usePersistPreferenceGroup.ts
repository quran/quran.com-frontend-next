/* eslint-disable react-func/max-lines-per-function */
import { useMemo } from 'react';

import { Action } from '@reduxjs/toolkit';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import { ToastStatus, useToast } from 'src/components/dls/Toast/Toast';
import SliceName from 'src/redux/types/SliceName';
import { addOrUpdateUserPreference } from 'src/utils/auth/api';
import { isLoggedIn } from 'src/utils/auth/login';
import { formatPreferenceGroupValue } from 'src/utils/auth/preferencesMapper';
import PreferenceGroup from 'types/auth/PreferenceGroup';

/**
 * A hook that will be used to:
 * 1. If the user is logged in, we persist settings
 * to the DB then dispatch the redux action that
 * would apply the changes locally (and might also persist
 * it locally in the localStorage depending on the slice)
 * 2. If not, just dispatch the action.
 *
 * @returns {Record<string, any>}
 */
const usePersistPreferenceGroup = (): Record<string, any> => {
  const dispatch = useDispatch();
  const toast = useToast();
  const { t } = useTranslation('common');

  const actions = useMemo(
    () => ({
      onSettingsChangeWithoutDispatch: (
        key: string,
        value: string | number | boolean | Record<string, any>,
        currentSliceValue: any,
        sliceName: SliceName,
        preferenceGroup: PreferenceGroup,
        callback: () => void,
      ) => {
        if (isLoggedIn()) {
          addOrUpdateUserPreference(
            formatPreferenceGroupValue(sliceName, currentSliceValue, key, value),
            preferenceGroup,
          ).then(() => {
            callback();
          });
        } else {
          callback();
        }
      },
      onSettingsChange: (
        key: string,
        value: string | number | boolean | Record<string, any>,
        action: Action,
        currentSliceValue: any,
        undoAction: Action,
        sliceName: SliceName,
        preferenceGroup: PreferenceGroup,
        successCallback?: () => void,
      ) => {
        if (isLoggedIn()) {
          // 1. dispatch the action first
          dispatch(action);
          addOrUpdateUserPreference(
            formatPreferenceGroupValue(sliceName, currentSliceValue, key, value),
            preferenceGroup,
          )
            .then(() => {
              if (successCallback) {
                successCallback();
              }
            })
            .catch(() => {
              toast(t('error.pref-persist-fail'), {
                status: ToastStatus.Warning,
                actions: [
                  {
                    text: t('undo'),
                    primary: true,
                    onClick: () => {
                      dispatch(undoAction);
                    },
                  },
                  {
                    text: t('continue'),
                    primary: false,
                    onClick: () => {
                      if (successCallback) {
                        successCallback();
                      }
                    },
                  },
                ],
              });
            });
        } else {
          dispatch(action);
        }
      },
    }),
    [dispatch, t, toast],
  );

  return actions;
};

export default usePersistPreferenceGroup;
