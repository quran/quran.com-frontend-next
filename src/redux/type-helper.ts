// Reference: https://github.dev/piotrwitek/typesafe-actions/blob/master/src/type-helpers.ts
type TypeConstant = string;
type Action<TType extends TypeConstant = TypeConstant> = {
  type: TType;
};
type Reducer<TState, TAction extends Action> = (
  state: TState | undefined,
  action: TAction,
) => TState;

/**
 * Typescript type helper to infer RootState from reducer
 * https://github.com/piotrwitek/typesafe-actions#statetype
 */
export type StateType<TReducerOrMap> = TReducerOrMap extends Reducer<any, any>
  ? ReturnType<TReducerOrMap>
  : TReducerOrMap extends Record<any, any>
  ? { [K in keyof TReducerOrMap]: StateType<TReducerOrMap[K]> }
  : never;
