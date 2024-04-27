import type { RenderMediaOnLambdaOutput } from '@remotion/lambda/client';

const makeRequest = async <Res>(endpoint: string, body: unknown): Promise<Res> => {
  const result = await fetch(endpoint, {
    method: 'post',
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
    },
  });
  const json = await result.json();
  if (json.type === 'error') {
    throw new Error(json.message);
  }

  return json.data;
};

export const renderVideo = async ({ id, inputProps }: { id: string; inputProps }) => {
  const body = {
    id,
    inputProps,
  };

  return makeRequest<RenderMediaOnLambdaOutput>('/api/lambda/render', body);
};

export const getProgress = async ({ id, bucketName }: { id: string; bucketName: string }) => {
  const body = {
    id,
    bucketName,
  };

  return makeRequest('/api/lambda/progress', body);
};
