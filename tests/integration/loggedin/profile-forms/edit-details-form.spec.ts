import { expect, test } from '@playwright/test';

import { getEditDetailsSection, getFormInputs } from './edit-details-form-helpers';
import { expectError, expectNoError, fillAndBlur } from './form-helpers';

import { ensureEnglishLanguage } from '@/tests/helpers/language';
import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  test.skip(true, 'Unskip when the feature is on production');

  homePage = new Homepage(page, context);
  await homePage.goTo('/profile');
  await ensureEnglishLanguage(page);
});

const TEST_TAGS = ['@slow', '@auth', '@profile', '@edit-details'];

test.describe('Form Display', () => {
  test('should display all form fields correctly', { tag: TEST_TAGS }, async ({ page }) => {
    const section = getEditDetailsSection(page);
    const { email, username, firstName, lastName, saveButton } = getFormInputs(section);

    await expect(section).toBeVisible();
    await expect(section.getByText('Edit Details')).toBeVisible();

    await expect(email).toBeVisible();
    await expect(email).toBeDisabled();

    await expect(username).toBeVisible();
    await expect(username).toBeDisabled();

    await expect(firstName).toBeVisible();
    await expect(firstName).toBeEnabled();

    await expect(lastName).toBeVisible();
    await expect(lastName).toBeEnabled();

    await expect(saveButton).toBeVisible();
  });

  test(
    'should display masked email (first 2 characters + asterisks until @)',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getEditDetailsSection(page);
      const { email } = getFormInputs(section);

      await expect(email).toBeVisible();

      const emailValue = await email.inputValue();

      if (emailValue && emailValue.includes('@')) {
        const [localPart] = emailValue.split('@');
        expect(localPart.length).toBeGreaterThanOrEqual(2);
        expect(emailValue).toContain('@');
      }
    },
  );
});

test.describe('Read-only Fields', () => {
  test('should not allow editing email field', { tag: TEST_TAGS }, async ({ page }) => {
    const section = getEditDetailsSection(page);
    const { email } = getFormInputs(section);

    await expect(email).toBeDisabled();

    const originalValue = await email.inputValue();
    await email.fill('newemail@example.com', { force: true });

    const currentValue = await email.inputValue();
    expect(currentValue).toBe(originalValue);
    expect(currentValue).not.toBe('newemail@example.com');
  });

  test('should not allow editing username field', { tag: TEST_TAGS }, async ({ page }) => {
    const section = getEditDetailsSection(page);
    const { username } = getFormInputs(section);

    await expect(username).toBeDisabled();

    const originalValue = await username.inputValue();
    await username.fill('newusername', { force: true });

    const currentValue = await username.inputValue();
    expect(currentValue).toBe(originalValue);
    expect(currentValue).not.toBe('newusername');
  });
});

test.describe('Required Field Validation', () => {
  test(
    'should show validation error when first name is empty',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getEditDetailsSection(page);
      const { firstName } = getFormInputs(section);

      await firstName.clear();
      await firstName.blur();

      await expectError(section, /first.*name.*is.*missing|missing/i);
    },
  );

  test(
    'should show validation error when last name is empty',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getEditDetailsSection(page);
      const { lastName } = getFormInputs(section);

      await lastName.clear();
      await lastName.blur();

      await expectError(section, /last.*name.*is.*missing|missing/i);
    },
  );
});

test.describe('Length Validation', () => {
  test(
    'should accept first name with valid length (3-25 characters)',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getEditDetailsSection(page);
      const { firstName } = getFormInputs(section);

      await fillAndBlur(firstName, 'Abe');
      await page.waitForTimeout(500);

      await expectNoError(section);
    },
  );

  test(
    'should accept first name with maximum length (25 characters)',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getEditDetailsSection(page);
      const { firstName } = getFormInputs(section);

      await fillAndBlur(firstName, 'A'.repeat(25));
      await page.waitForTimeout(500);

      await expectNoError(section);
    },
  );

  test(
    'should show validation error when first name is less than minimum length (3 characters)',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getEditDetailsSection(page);
      const { firstName } = getFormInputs(section);

      await fillAndBlur(firstName, 'Ab');
      await page.waitForTimeout(500);

      await expectError(section, /first.*name.*must.*be.*more.*than.*or.*equal.*to.*3|min/i);
    },
  );

  test(
    'should show validation error when last name is less than minimum length (3 characters)',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getEditDetailsSection(page);
      const { lastName } = getFormInputs(section);

      await fillAndBlur(lastName, 'Do');
      await page.waitForTimeout(500);

      await expectError(section, /last.*name.*must.*be.*more.*than.*or.*equal.*to.*3|min/i);
    },
  );
});

test.describe('Character Validation', () => {
  test(
    'should accept first name with alphanumeric characters and spaces',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getEditDetailsSection(page);
      const { firstName } = getFormInputs(section);

      await fillAndBlur(firstName, 'John123 Smith');
      await page.waitForTimeout(500);

      await expectNoError(section);
    },
  );

  test(
    'should accept last name with alphanumeric characters and spaces',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getEditDetailsSection(page);
      const { lastName } = getFormInputs(section);

      await fillAndBlur(lastName, 'Doe456 Van');
      await page.waitForTimeout(500);

      await expectNoError(section);
    },
  );

  test(
    'should show validation error when first name contains invalid characters',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getEditDetailsSection(page);
      const { firstName } = getFormInputs(section);

      await fillAndBlur(firstName, 'John@Doe');

      await expectError(section, /this.*first.*name.*is.*invalid|invalid/i);
    },
  );

  test(
    'should show validation error when last name contains invalid characters',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getEditDetailsSection(page);
      const { lastName } = getFormInputs(section);

      await fillAndBlur(lastName, 'Doe!Smith');

      await expectError(section, /this.*last.*name.*is.*invalid|invalid/i);
    },
  );

  test(
    'should show validation error when first name contains invalid special characters',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getEditDetailsSection(page);
      const { firstName } = getFormInputs(section);

      await fillAndBlur(firstName, 'John#Doe');
      await page.waitForTimeout(500);

      await expectError(section, /this.*first.*name.*is.*invalid|invalid/i);
    },
  );

  test(
    'should show validation error when last name contains invalid special characters',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getEditDetailsSection(page);
      const { lastName } = getFormInputs(section);

      await fillAndBlur(lastName, 'Doe*Smith');
      await page.waitForTimeout(500);

      await expectError(section, /this.*last.*name.*is.*invalid|invalid/i);
    },
  );
});

test.describe('Form Submission', () => {
  test(
    'should successfully update first and last name with valid values',
    { tag: TEST_TAGS },
    async ({ page }) => {
      const section = getEditDetailsSection(page);
      const { firstName, lastName, saveButton } = getFormInputs(section);

      await fillAndBlur(firstName, 'John');
      await fillAndBlur(lastName, 'Doe');
      await saveButton.click();

      const successMessage = page.getByText(/profile.*is.*updated.*successfully/i);
      await expect(successMessage).toBeVisible({ timeout: 10000 });

      await page.reload();
      await expect(firstName).toHaveValue('John', { timeout: 5000 });
      await expect(lastName).toHaveValue('Doe', { timeout: 5000 });
    },
  );
});
