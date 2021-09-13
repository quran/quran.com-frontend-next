import { RootState } from 'src/redux/RootState';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Reference: https://redux.js.org/usage/usage-with-typescript

// We use this throughout our codebase instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
