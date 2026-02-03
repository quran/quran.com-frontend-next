import { expect, type Page } from '@playwright/test';

import { TestId } from '@/tests/test-ids';
import { USER_ID_COOKIE_NAME } from '@/utils/auth/constants';

const hasAuthCookie = async (page: Page) => {
  const cookies = await page.context().cookies();
  return cookies.some(
    (cookie) => cookie.name === USER_ID_COOKIE_NAME || cookie.name.startsWith('id_'),
  );
};

const waitForAuthCookie = async (page: Page, timeout = 60000) => {
  await expect.poll(() => hasAuthCookie(page), { timeout }).toBe(true);
};

const getBaseUrl = () =>
  process.env.PLAYWRIGHT_TEST_BASE_URL || `http://localhost:${process.env.PORT || '3000'}`;

const isProdEdge = () => getBaseUrl().includes('ssr.quran.com');

const addCookiesFromHeaders = async (page: Page, setCookieHeaders: string[]) => {
  const baseUrl = getBaseUrl();
  const url = new URL(baseUrl);
  const cookies = setCookieHeaders
    .map((cookieStr) => cookieStr.split(';')[0])
    .map((pair) => {
      const [name, ...rest] = pair.split('=');
      return {
        name: name.trim(),
        value: rest.join('=').trim(),
        url: url.origin,
        path: '/',
      };
    })
    .filter((cookie) => cookie.name && cookie.value);

  if (cookies.length > 0) {
    await page.context().addCookies(cookies);
  }
};

const tryApiLogin = async (
  page: Page,
  email: string,
  password: string,
): Promise<{ ok: boolean; token?: string; setCookieHeaders: string[]; status: number }> => {
  const res = await page.request.post('/api/proxy/auth/users/login', {
    headers: { 'content-type': 'application/json' },
    data: { email, password },
  });

  if (!res.ok()) {
    return { ok: false, setCookieHeaders: [], status: res.status() };
  }

  const setCookieHeaders = res
    .headersArray()
    .filter((header) => header.name.toLowerCase() === 'set-cookie')
    .map((header) => header.value);

  let token: string | undefined;
  try {
    const data = await res.json();
    token = data?.token;
  } catch {
    token = undefined;
  }

  return { ok: true, token, setCookieHeaders, status: res.status() };
};

export const loginWithEmail = async (
  page: Page,
  { email, password }: { email: string; password: string },
) => {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  if (await hasAuthCookie(page)) {
    return;
  }

  const apiLogin = await tryApiLogin(page, email, password);
  // eslint-disable-next-line no-console
  console.log(
    `[auth] login API status=${apiLogin.status} token=${Boolean(apiLogin.token)} setCookie=${apiLogin.setCookieHeaders.length}`,
  );
  if (apiLogin.ok) {
    if (apiLogin.setCookieHeaders.length > 0) {
      await addCookiesFromHeaders(page, apiLogin.setCookieHeaders);
    } else if (apiLogin.token) {
      const redirect = encodeURIComponent('/');
      await page.goto(`/auth?token=${apiLogin.token}&r=${redirect}`, {
        waitUntil: 'domcontentloaded',
      });
      // eslint-disable-next-line no-console
      console.log(`[auth] /auth final url=${page.url()}`);
    }

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // eslint-disable-next-line no-console
    console.log(`[auth] post-login url=${page.url()}`);
    await waitForAuthCookie(page, 60000);
    // Best-effort: the auth cookie is the source of truth. Some pages/render paths
    // may not show the avatar immediately (or at all) even though auth succeeded.
    try {
      await expect(page.getByTestId(TestId.PROFILE_AVATAR_BUTTON).first()).toBeAttached({
        timeout: 30000,
      });
    } catch {
      // ignore
    }
    return;
  }

  if (!apiLogin.ok && apiLogin.status === 403 && isProdEdge()) {
    // eslint-disable-next-line no-console
    console.log(
      '[auth] API login blocked (403). Falling back to UI login. If this still fails, use PLAYWRIGHT_STORAGE_STATE.',
    );
  }

  const continueButton = page.getByRole('button', { name: /continue with email/i });
  if (await continueButton.isVisible().catch(() => false)) {
    await continueButton.click();
  }

  const emailInput = page.getByTestId('signin-email-input').or(
    page.getByPlaceholder(/email address/i),
  );
  const passwordInput = page.getByTestId('signin-password-input').or(
    page.getByPlaceholder(/password/i),
  );

  await expect(emailInput).toBeVisible({ timeout: 60000 });
  await emailInput.fill(email);
  await passwordInput.fill(password);

  const submitButton = page
    .getByTestId('signin-continue-button')
    .or(page.locator('form').getByRole('button', { name: /sign in/i }));
  await submitButton.click();

  const startTime = Date.now();
  const errorLocator = page.getByText(
    /invalid email|invalid password|too many attempts|captcha|verification/i,
  );

  while (Date.now() - startTime < 60000) {
    if (await hasAuthCookie(page)) break;
    if (await errorLocator.isVisible().catch(() => false)) {
      throw new Error(`[auth] login failed: ${await errorLocator.innerText()}`);
    }
    await page.waitForTimeout(500);
  }

  await waitForAuthCookie(page, 60000);

  try {
    await expect(page.getByTestId(TestId.PROFILE_AVATAR_BUTTON).first()).toBeAttached({
      timeout: 30000,
    });
  } catch {
    // ignore
  }
};
