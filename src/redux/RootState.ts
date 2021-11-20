import { StateType } from './type-helper';

// reference:
// - https://github.com/piotrwitek/react-redux-typescript-guide/issues/154#issuecomment-813029148
// - https://github.com/piotrwitek/typesafe-actions#statetype
export type RootState = StateType<typeof import('./store').rootReducer>;
