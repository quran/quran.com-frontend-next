import { RootState } from 'src/redux/RootState';
import { TypedUseSelectorHook, useSelector } from 'react-redux';

// Reference: https://redux.js.org/usage/usage-with-typescript

// We use this throughout our codebase instead of plain `useSelector`
const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

export default useTypedSelector;
