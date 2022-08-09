import { createContext } from 'react';

import ChaptersData from 'types/ChaptersData';

const DataContext = createContext<ChaptersData>({});

export default DataContext;
