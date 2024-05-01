/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable no-await-in-loop */
// @ts-nocheck
import { useCallback, useMemo, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import GenerateMediaFileRequest, { MediaType } from '@/types/Media/GenerateMediaFileRequest';
import { generateMediaFile, getMediaFileProgress } from '@/utils/auth/api';

export enum RenderStatus {
  INIT = 'init',
  INVOKING = 'invoking',
  RENDERING = 'rendering',
  ERROR = 'error',
  DONE = 'done',
}

export type State =
  | {
      status: RenderStatus.INIT;
    }
  | {
      status: RenderStatus.INVOKING;
    }
  | {
      renderId: string;
      progress: number;
      status: RenderStatus.RENDERING;
    }
  | {
      renderId: string | null;
      status: RenderStatus.ERROR;
      error: Error;
    }
  | {
      url: string;
      size: number;
      status: RenderStatus.DONE;
    };

const wait = async (milliSeconds: number) => {
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, milliSeconds);
  });
};

export const useGenerateMediaFile = (inputProps: GenerateMediaFileRequest) => {
  const { t } = useTranslation('common');
  const [state, setState] = useState<State>({
    status: RenderStatus.INIT,
  });

  // eslint-disable-next-line react-func/max-lines-per-function
  const renderMedia = useCallback(
    async (type: MediaType, extraInputProps = {}) => {
      let pending = true;
      setState({
        status: RenderStatus.INVOKING,
      });
      try {
        const response = await generateMediaFile({
          ...inputProps,
          ...extraInputProps,
          type,
        });
        if (response.success === false) {
          setState({
            status: RenderStatus.ERROR,
            error: new Error(t(`error.${response.error.code}`)),
            renderId: null,
          });
          return;
        }
        const { data } = response;
        if (type === MediaType.IMAGE) {
          setState({
            url: data.url,
            status: RenderStatus.DONE,
          });
          pending = false;
          return;
        }
        const { renderId } = data;
        setState({
          status: RenderStatus.RENDERING,
          progress: 0,
          renderId,
        });
        while (pending) {
          const {
            data: { isDone, progress, url },
          } = await getMediaFileProgress(renderId);
          if (isDone) {
            setState({
              progress: 100,
              url,
              status: RenderStatus.DONE,
            });
            pending = false;
            break;
          }
          setState({
            status: RenderStatus.RENDERING,
            progress,
            renderId,
          });
          await wait(1000);
        }
      } catch (err) {
        setState({
          status: RenderStatus.ERROR,
          error: err as Error,
          renderId: null,
        });
      }
    },
    [inputProps],
  );

  const undo = useCallback(() => {
    setState({ status: RenderStatus.INIT });
  }, []);

  return useMemo(() => {
    return {
      renderMedia,
      state,
      undo,
    };
  }, [renderMedia, state, undo]);
};
