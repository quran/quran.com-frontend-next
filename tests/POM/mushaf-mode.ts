import { Page } from '@playwright/test';

export default class QuranPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async mushafMode(isMobile: boolean) {
    if (isMobile) {
      await this.page.getByTestId('reading-tab').click();
    } else {
      await this.page.getByTestId('reading-button').click();
    }
  }
}
