/**
 * DeepPartial type helper for test utilities.
 *
 * RTK v2 removed the public `PreloadedState<S>` / `DeepPartial<S>` exports.
 * This local definition lets `makeStore()` and `renderWithProviders()` accept
 * partially-specified Redux state without requiring every nested field.
 *
 * @example
 * // Pass only the fields you care about — all other slice fields keep their defaults
 * makeStore({ audioPlayerState: { isPlaying: true } });
 */
export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;
