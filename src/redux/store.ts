import { configureStore } from '@reduxjs/toolkit';

export default configureStore({
  reducer: {}, // TODO: add reducers here
  devTools: process.env.NODE_ENV === 'development', // disables the devtools in production
});
