import { BrowserContext, Locator, Page, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';
import { TestId } from '@/tests/test-ids';

class StudyModePage extends Homepage {
  readonly modal: Locator;

  readonly header: Locator;

  readonly closeButton: Locator;

  readonly prevVerseButton: Locator;

  readonly nextVerseButton: Locator;

  readonly content: Locator;

  readonly skeleton: Locator;

  readonly errorContainer: Locator;

  constructor(page: Page, context: BrowserContext) {
    super(page, context);
    this.modal = page.getByTestId(TestId.STUDY_MODE_MODAL);
    this.header = page.getByTestId(TestId.STUDY_MODE_HEADER);
    this.closeButton = page.getByTestId(TestId.STUDY_MODE_CLOSE_BUTTON);
    this.prevVerseButton = page.getByTestId(TestId.STUDY_MODE_PREV_VERSE_BUTTON);
    this.nextVerseButton = page.getByTestId(TestId.STUDY_MODE_NEXT_VERSE_BUTTON);
    this.content = page.getByTestId(TestId.STUDY_MODE_CONTENT);
    this.skeleton = page.getByTestId(TestId.STUDY_MODE_SKELETON);
    this.errorContainer = page.getByTestId(TestId.STUDY_MODE_ERROR);
  }

  async goToTafsirPage(verseKey: string, tafsirSlug: string = 'en-tafisr-ibn-kathir') {
    await this.goTo(`/${verseKey}/tafsirs/${tafsirSlug}`);
    await this.page.waitForLoadState('networkidle');
  }

  async goToReflectionsPage(verseKey: string) {
    await this.goTo(`/${verseKey}/reflections`);
    await this.page.waitForLoadState('networkidle');
  }

  async goToLessonsPage(verseKey: string) {
    await this.goTo(`/${verseKey}/lessons`);
    await this.page.waitForLoadState('networkidle');
  }

  async goToAnswersPage(verseKey: string) {
    await this.goTo(`/${verseKey}/answers`);
    await this.page.waitForLoadState('networkidle');
  }

  async clickPreviousVerse() {
    await this.prevVerseButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickNextVerse() {
    await this.nextVerseButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickCloseButton() {
    await this.closeButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async getTabButton(tabId: TestId) {
    return this.page.getByTestId(tabId);
  }

  async switchToTab(tabId: TestId) {
    const tabButton = await this.getTabButton(tabId);
    await tabButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async isModalVisible() {
    return this.modal.isVisible();
  }

  async isContentVisible() {
    return this.content.isVisible();
  }

  async waitForContent() {
    await expect(this.modal).toBeVisible({ timeout: 15000 });
    await expect(this.content).toBeVisible({ timeout: 15000 });
  }

  async waitForModalReady() {
    await expect(this.modal).toBeVisible({ timeout: 15000 });
    await expect(this.header).toBeVisible({ timeout: 10000 });
  }

  async waitForSkeleton() {
    await this.skeleton.waitFor({ state: 'visible', timeout: 5000 });
  }

  async waitForUrlContains(text: string, timeout: number = 5000) {
    await expect(this.page).toHaveURL(new RegExp(text), { timeout });
  }
}

export default StudyModePage;
