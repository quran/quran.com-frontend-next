import { afterAll, afterEach, beforeAll, vi } from 'vitest';

import { server } from './msw/server';

/**
 * Global mock for defaultSettings/util.
 *
 * The real util.ts uses require(`src/redux/defaultSettings/locales/${locale}`)
 * — a dynamic template-literal require that Vite cannot resolve at runtime via
 * aliases. The manual mock at src/redux/defaultSettings/__mocks__/util.ts
 * provides the English defaults statically. Individual tests can override this
 * with their own vi.mock('@/redux/defaultSettings/util') call.
 */
vi.mock('@/redux/defaultSettings/util');

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
