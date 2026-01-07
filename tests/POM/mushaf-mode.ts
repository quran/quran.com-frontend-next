import { Page } from '@playwright/test';

import { TestId } from '@/tests/test-ids';

export default class QuranPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async mushafMode(isMobile: boolean) {
    if (isMobile) {
      await this.page.getByTestId(TestId.READING_TAB).click();
    } else {
      await this.page.getByTestId(TestId.READING_BUTTON).click();
    }
  }
}
