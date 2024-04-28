/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable no-await-in-loop */
import { useCallback, useMemo, useState } from 'react';

import { z } from 'zod';

import { getProgress, renderVideoOrImage } from '../lambda/api';

import { COMPOSITION_PROPS } from '@/utils/videoGenerator/constants';

export enum RenderStatus {
  INIT = 'init',
  INVOKING = 'invoking',
  RENDERING = 'rendering',
  ERROR = 'error',
  DONE = 'done',
}

export enum MediaType {
  VIDEO = 'video',
  IMAGE = 'image',
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
      bucketName: string;
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

export const useRendering = (id: string, inputProps: z.infer<typeof COMPOSITION_PROPS>) => {
  const [state, setState] = useState<State>({
    status: RenderStatus.INIT,
  });

  // eslint-disable-next-line react-func/max-lines-per-function
  const renderMedia = useCallback(
    async (type: MediaType) => {
      let pending = true;
      setState({
        status: RenderStatus.INVOKING,
      });
      try {
        const response = await renderVideoOrImage({ id, inputProps, type });
        if (type === MediaType.IMAGE) {
          setState({
            size: response.sizeInBytes,
            url: response.url,
            status: RenderStatus.DONE,
          });
          pending = false;
          return;
        }
        const { renderId, bucketName } = response;
        setState({
          status: RenderStatus.RENDERING,
          progress: 0,
          renderId,
          bucketName,
        });
        while (pending) {
          const result = await getProgress({
            id: renderId,
            bucketName,
          });
          // eslint-disable-next-line default-case
          switch (result.type) {
            case 'error': {
              setState({
                status: RenderStatus.ERROR,
                renderId,
                error: new Error(result.message),
              });
              pending = false;
              break;
            }
            case 'done': {
              setState({
                size: result.size,
                url: result.url,
                status: RenderStatus.DONE,
              });
              pending = false;
              break;
            }
            case 'progress': {
              setState({
                status: RenderStatus.RENDERING,
                bucketName,
                progress: result.progress,
                renderId,
              });
              await wait(1000);
            }
          }
        }
      } catch (err) {
        setState({
          status: RenderStatus.ERROR,
          error: err as Error,
          renderId: null,
        });
      }
    },
    [id, inputProps],
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
