import { StateType } from 'typesafe-actions';

// reference: https://github.com/piotrwitek/react-redux-typescript-guide/issues/154#issuecomment-813029148
export type RootState = StateType<typeof import('./store').rootReducer>;
