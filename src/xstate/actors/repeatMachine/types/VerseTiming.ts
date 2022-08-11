/* eslint-disable @typescript-eslint/naming-convention */

import Segment from 'types/Segment';

type VerseTiming = {
  verse_key: string;
  timestamp_from: number;
  timestamp_to: number;
  duration: number;
  segments: Segment[];
};

export default VerseTiming;
