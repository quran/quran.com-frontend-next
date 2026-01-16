import { test, expect } from '@playwright/test';

import { renderWidgetPage } from './widget-helper';

test.describe('Widget - localization', () => {
  test('Header localizes when locale is French', async ({ page }) => {
    const frame = await renderWidgetPage(page, {
      ayah: '2:255',
      translationIds: '131',
      locale: 'fr',
    });

    await expect(
      frame.getByText('Coran 2:255 (Sourate Al-Baqarah)', { exact: false }),
    ).toBeVisible();
  });

  test('Header localizes chapter and verse numbers in Arabic', async ({ page }) => {
    const frame = await renderWidgetPage(page, {
      ayah: '2:255',
      translationIds: '131',
      locale: 'ar',
    });

    const toArabicIndicDigits = (value: string): string => {
      const arabicDigits = [
        '\u0660',
        '\u0661',
        '\u0662',
        '\u0663',
        '\u0664',
        '\u0665',
        '\u0666',
        '\u0667',
        '\u0668',
        '\u0669',
      ];
      return value.replace(/\d/g, (digit) => arabicDigits[Number(digit)]);
    };

    const localizedCaption = `${toArabicIndicDigits('2')}:${toArabicIndicDigits('255')}`;
    await expect(frame.getByText(localizedCaption, { exact: false })).toBeVisible();
  });
});
