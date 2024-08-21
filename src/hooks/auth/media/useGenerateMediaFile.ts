/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable no-await-in-loop */
import { useCallback, useMemo, useState, useEffect } from 'react';

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
      errorDetails?: any;
    }
  | {
      status: RenderStatus.INVOKING;
      errorDetails?: any;
    }
  | {
      renderId: string;
      progress: number;
      status: RenderStatus.RENDERING;
      errorDetails?: any;
    }
  | {
      renderId: string | null;
      status: RenderStatus.ERROR;
      error: Error;
      errorDetails?: any;
    }
  | {
      url: string;
      progress: number;
      status: RenderStatus.DONE;
      errorDetails?: any;
    };

const wait = async (milliSeconds: number) => {
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, milliSeconds);
  });
};

// TODO: use useSWR instead
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
          const details = response?.error?.details || {};
          setState({
            status: RenderStatus.ERROR,
            error: new Error(t(`error.${response.error.code}`, details)),
            errorDetails: response.error,
            renderId: null,
          });
          return;
        }
        const { data } = response;
        if (type === MediaType.IMAGE) {
          setState({
            url: data.url,
            progress: 100,
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
    [inputProps, t],
  );

  const undo = useCallback(() => {
    setState({ status: RenderStatus.INIT });
  }, []);

  // listen to settings changes and undo the changes if the input props have changed
  useEffect(() => {
    undo();
  }, [inputProps, undo]);

  return useMemo(() => {
    return {
      renderMedia,
      state,
      undo,
    };
  }, [renderMedia, state, undo]);
};
