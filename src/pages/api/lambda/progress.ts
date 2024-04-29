/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable import/no-extraneous-dependencies */
import { speculateFunctionName, AwsRegion, getRenderProgress } from '@remotion/lambda/client';
import { z } from 'zod';

import { executeApi } from '../../../lambda/api-response';

import { DISK, RAM, REGION, TIMEOUT } from '@/utils/videoGenerator/constants';

export const ProgressRequest = z.object({
  bucketName: z.string(),
  id: z.string(),
});

const progress = executeApi(ProgressRequest, async (req, body) => {
  if (req.method !== 'POST') {
    throw new Error('Only POST requests are allowed');
  }

  const renderProgress = await getRenderProgress({
    bucketName: body.bucketName,
    functionName: speculateFunctionName({
      diskSizeInMb: DISK,
      memorySizeInMb: RAM,
      timeoutInSeconds: TIMEOUT,
    }),
    region: REGION as AwsRegion,
    renderId: body.id,
  });
  console.log(renderProgress);

  if (renderProgress.fatalErrorEncountered) {
    return {
      type: 'error',
      message: renderProgress.errors[0].message,
    };
  }

  if (renderProgress.done) {
    return {
      type: 'done',
      url: renderProgress.outputFile,
      size: renderProgress.outputSizeInBytes,
    };
  }

  return {
    type: 'progress',
    progress: Math.max(0.03, renderProgress.overallProgress),
  };
});

export default progress;
