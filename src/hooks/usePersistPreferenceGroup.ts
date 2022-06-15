/* eslint-disable react-func/max-lines-per-function */
import { useMemo } from 'react';

import { Action, AsyncThunkAction } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';

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
          )
            .then(() => {
              callback();
            })
            .catch(() => {
              // TODO: show an error
            });
        } else {
          callback();
        }
      },
      onSettingsChange: (
        key: string,
        value: string | number | boolean | Record<string, any>,
        action: Action | AsyncThunkAction<any, any, any>,
        currentSliceValue: any,
        sliceName: SliceName,
        preferenceGroup: PreferenceGroup,
        successCallback?: () => void,
      ) => {
        if (isLoggedIn()) {
          addOrUpdateUserPreference(
            formatPreferenceGroupValue(sliceName, currentSliceValue, key, value),
            preferenceGroup,
          )
            .then(() => {
              dispatch(action);
              if (successCallback) {
                successCallback();
              }
            })
            .catch(() => {
              // TODO: show an error
            });
        } else {
          dispatch(action);
        }
      },
    }),
    [dispatch],
  );

  return actions;
};

export default usePersistPreferenceGroup;
