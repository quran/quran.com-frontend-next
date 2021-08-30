// eslint-disable-next-line import/prefer-default-export
export const throwIfError = (res: any) => {
  if (res.stats === 500) {
    throw new Error('internal server error');
  }
};
