import { Page } from '@playwright/test';

export default class QuranPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async mushafMode(isMobile: boolean) {
    if (isMobile) {
      // scroll down a little to make the tab visible (bypassing a render issue)
      // FIXME: Remove this workaround when the underlying issue is fixed
      await this.page.keyboard.press('ArrowDown', { delay: 100 });
      await this.page.keyboard.press('ArrowDown', { delay: 100 });
      await this.page.keyboard.press('ArrowDown', { delay: 100 });
      await this.page.keyboard.press('ArrowUp', { delay: 100 });

      await this.page.locator('#reading-tab').click();
    } else {
      await this.page.getByTestId('reading-button').click();
    }
  }
}
