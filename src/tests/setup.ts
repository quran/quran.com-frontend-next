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

// Use 'error' so any request that reaches the network without a handler fails the test
// immediately, rather than logging a warning that is easy to miss in CI output.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
// resetHandlers() restores the default handler list defined in handlers.ts.
// The Vitest ESM handlers have no shared in-memory data store, so this is
// sufficient to guarantee full test isolation — no clearTestData() call needed.
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
