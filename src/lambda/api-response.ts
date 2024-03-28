import { NextApiRequest, NextApiResponse } from 'next';

export type ApiResponse<Res> =
  | {
      type: 'error';
      message: string;
    }
  | {
      type: 'success';
      data: Res;
    };

export const executeApi =
  (schema, handler) => async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const parsed = schema.parse(req.body);
      const data = await handler(req, parsed, res);
      res.status(200).json({
        type: 'success',
        data,
      });
    } catch (err) {
      res.status(500).json({ type: 'error', message: (err as Error).message });
    }
  };
