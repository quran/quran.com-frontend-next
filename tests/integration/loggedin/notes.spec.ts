/* eslint-disable react-func/max-lines-per-function, max-lines */
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

import { switchToTranslationMode } from '@/tests/helpers/mode-switching';
import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

const TEST_VERSE_KEY = '1:1';
const TEST_NOTE_TEXT = 'This is a test private note';
const UPDATED_NOTE_TEXT = 'This is an updated test private note';

/**
 * Open the notes modal from translation view by clicking the notes action button
 */
const openNotesModalFromTranslationView = async (page: Page, verseKey: string = TEST_VERSE_KEY) => {
  const verse = page.getByTestId(`verse-${verseKey}`);
  const notesButton = verse.getByTestId('notes-action-button');
  await expect(notesButton).toBeVisible();
  await notesButton.click();

  const rootContent = page.getByTestId('modal-content');
  await expect(rootContent).toBeVisible();
  const modal = page.getByTestId('add-note-modal-content');
  await expect(modal).toBeVisible();
};

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo('/1/1');
});

test.describe('Notes - Authenticated Users', () => {
  test.describe('Modal Opening', () => {
    test(
      'should open notes modal and show reflection intro',
      { tag: ['@notes', '@auth', '@logged-in', '@smoke', '@modal-opening'] },
      async ({ page }) => {
        // Given: User is in translation mode
        await switchToTranslationMode(page);

        // When: User clicks the notes button on a verse
        await openNotesModalFromTranslationView(page);

        // Then: Notes modal should open with proper content
        await expect(page.getByTestId('add-note-modal-title')).toBeVisible();
        await expect(page.getByTestId('notes-textarea')).toBeVisible();
        await expect(page.getByTestId('save-private-button')).toBeVisible();
        await expect(page.getByTestId('save-to-qr-button')).toBeVisible();
      },
    );
  });

  test.describe('Text Content Expansions', () => {
    test(
      'should handle learn more toggle in text content expansions',
      { tag: ['@notes', '@publish-note', '@qr', '@confirmation'] },
      async ({ page }) => {
        // User opens confirmation modal
        await switchToTranslationMode(page);
        await openNotesModalFromTranslationView(page);

        // Reflection intro should be visible
        const reflectionIntro = page.getByTestId('reflection-intro');
        await expect(reflectionIntro).toBeVisible();

        // Learn more toggle should be visible
        const RIToggle = reflectionIntro.getByTestId('ri-toggle');
        await expect(RIToggle).toBeVisible();

        // Reflection intro Learn more content should be hidden by default
        const RIContent = reflectionIntro.getByTestId('ri-content');
        await expect(RIContent).toBeHidden();

        // User clicks Reflection intro Learn more toggle, content should expand
        await RIToggle.click();
        await expect(RIContent).toBeVisible();

        // User clicks Reflection intro Learn more toggle again, content should collapse
        await RIToggle.click();
        await expect(RIContent).toBeHidden();

        // Filling the textarea so validations pass
        const textarea = page.getByTestId('notes-textarea');
        await textarea.fill(TEST_NOTE_TEXT);

        const saveToQRButton = page.getByTestId('save-to-qr-button');
        await saveToQRButton.click();

        // Confirmation modal should open
        const confirmationModal = page.getByTestId('qr-confirmation-modal-content');
        await expect(confirmationModal).toBeVisible();

        // Post reflection intro should be visible
        const postReflectionIntro = page.getByTestId('post-reflection-intro');
        await expect(postReflectionIntro).toBeVisible();

        // Post reflection intro Learn more toggle should be visible
        const PRToggle = postReflectionIntro.getByTestId('pr-toggle');
        await expect(PRToggle).toBeVisible();

        // Post reflection intro Learn more content should be hidden by default
        const PRContent = postReflectionIntro.getByTestId('pr-content');
        await expect(PRContent).toBeHidden();

        // User clicks Post reflection intro Learn more toggle, content should expand
        await PRToggle.click();
        await expect(PRContent).toBeVisible();

        // User clicks Post reflection intro Learn more toggle again, content should collapse
        await PRToggle.click();
        await expect(PRContent).toBeHidden();
      },
    );
  });

  test.describe('Form Validation', () => {
    test(
      'should show validation errors',
      { tag: ['@notes', '@form-validation', '@validation'] },
      async ({ page }) => {
        await switchToTranslationMode(page);
        await openNotesModalFromTranslationView(page);

        // When: User tries to save empty note publicly
        const savePublicButton = page.getByTestId('save-to-qr-button');
        await savePublicButton.click();

        // Then: Validation error should be shown
        await expect(page.getByTestId('note-input-error-required-field')).toBeVisible();

        // When: User enters very short text and tries to save
        const textarea = page.getByTestId('notes-textarea');
        await textarea.fill('Hi');
        await savePublicButton.click();

        // Then: Validation error should be shown
        await expect(page.getByTestId('note-input-error-minimum-length')).toBeVisible();

        // When: User enters a note longer than 10000 characters and tries to save
        const longText = 'a'.repeat(10001);
        await textarea.fill(longText);
        await savePublicButton.click();

        // Then: Validation error should be shown
        await expect(page.getByTestId('note-input-error-maximum-length')).toBeVisible();
      },
    );
  });

  test.describe('Private Note Creation', () => {
    test(
      'should create private note and show in my notes',
      { tag: ['@notes', '@create-note', '@private'] },
      async ({ page }) => {
        await switchToTranslationMode(page);
        await openNotesModalFromTranslationView(page);

        // When: User enters note text and saves privately
        const textarea = page.getByTestId('notes-textarea');
        await textarea.fill(TEST_NOTE_TEXT);
        const savePrivateButton = page.getByTestId('save-private-button');
        await savePrivateButton.click();

        // Then: Note should be saved and my notes modal should open
        const myNotesModal = page.getByTestId('my-notes-modal-content');
        await expect(myNotesModal).toBeVisible();

        // And: Latest note should be visible in the list
        const notesCard = myNotesModal.getByTestId(/^note-card-/).first();
        await expect(notesCard).toBeVisible();
        await expect(notesCard.getByTestId('note-text')).toContainText(TEST_NOTE_TEXT);

        // And: Private note should not show QR view button
        const qrViewButton = notesCard.getByTestId('qr-view-button');
        await expect(qrViewButton).not.toBeVisible();
      },
    );
  });

  test.describe('My Notes Modal', () => {
    test(
      'should display notes count and list',
      { tag: ['@notes', '@my-notes', '@notes-list'] },
      async ({ page }) => {
        await switchToTranslationMode(page);
        await openNotesModalFromTranslationView(page);

        const notesOnVerseButton = page.getByTestId('notes-on-verse-button');
        await notesOnVerseButton.click();

        // My notes modal should open with proper title and notes
        const myNotesModal = page.getByTestId('my-notes-modal-content');
        await expect(myNotesModal).toBeVisible();

        // Should show notes count in title
        await expect(page.getByText(/My Notes \(\d+\)/)).toBeVisible();

        // Should have note cards
        const notesCards = await myNotesModal.getByTestId(/^note-card-/).count();
        expect(notesCards).toBeGreaterThan(0);

        const addAnotherButton = page.getByTestId('add-another-note-button');
        expect(addAnotherButton).toBeVisible();

        await addAnotherButton.click();

        const addNoteModal = page.getByTestId('add-note-modal-content');
        await expect(addNoteModal).toBeVisible();
      },
    );
  });

  test.describe('Note Editing', () => {
    test(
      'should edit note and persist changes',
      { tag: ['@notes', '@edit-note', '@update'] },
      async ({ page }) => {
        await switchToTranslationMode(page);
        await openNotesModalFromTranslationView(page);

        const updatedNoteTextWithTimestamp = `${UPDATED_NOTE_TEXT} ${new Date().toISOString()}`;

        const notesOnVerseButton = page.getByTestId('notes-on-verse-button');
        await notesOnVerseButton.click();

        const myNotesModal = page.getByTestId('my-notes-modal-content');
        await expect(myNotesModal).toBeVisible();

        const noteCard = myNotesModal.getByTestId(/^note-card-/).first();

        const selectedNoteTestId = await noteCard.getAttribute('data-testid');
        expect(selectedNoteTestId).toBeDefined();

        const selectedNoteText = await noteCard.getByTestId('note-text').textContent();
        expect(selectedNoteText).toBeDefined();

        const editButton = noteCard.getByTestId('edit-note-button');
        await editButton.click();

        // Edit modal should open with current content
        const editModal = page.getByTestId('edit-note-modal-content');
        await expect(editModal).toBeVisible();

        const textarea = page.getByTestId('notes-textarea');
        expect(textarea).toHaveValue(selectedNoteText);

        // User updates the note and saves
        await textarea.fill(updatedNoteTextWithTimestamp);
        const savePrivateButton = page.getByTestId('save-private-button');
        await savePrivateButton.click();

        // Edit modal should close and my notes should show updated content
        await expect(editModal).toBeHidden();
        await expect(myNotesModal).toBeVisible();

        const updatedNoteCard = myNotesModal.getByTestId(selectedNoteTestId);
        await expect(updatedNoteCard.getByTestId('note-text')).toContainText(
          updatedNoteTextWithTimestamp,
        );
      },
    );
  });

  test.describe('Public Note Publishing', () => {
    test(
      'should publish note to QuranReflect with confirmation',
      { tag: ['@notes', '@publish-note', '@qr', '@public'] },
      async ({ page }) => {
        await switchToTranslationMode(page);
        await openNotesModalFromTranslationView(page);

        const notesOnVerseButton = page.getByTestId('notes-on-verse-button');
        await notesOnVerseButton.click();

        const myNotesModal = page.getByTestId('my-notes-modal-content');
        await expect(myNotesModal).toBeVisible();

        const noteCardWithoutQR = myNotesModal
          .getByTestId(/^note-card-/)
          .filter({ hasNot: myNotesModal.getByTestId('qr-view-button') })
          .first();

        const selectedNoteTestId = await noteCardWithoutQR.getAttribute('data-testid');
        expect(selectedNoteTestId).toBeDefined();

        const selectedNoteText = await noteCardWithoutQR.getByTestId('note-text').textContent();
        expect(selectedNoteText).toBeDefined();

        const editButton = noteCardWithoutQR.getByTestId('edit-note-button');
        await editButton.click();

        const editModal = page.getByTestId('edit-note-modal-content');
        await expect(editModal).toBeVisible();

        const textarea = page.getByTestId('notes-textarea');
        expect(textarea).toHaveValue(selectedNoteText);

        // User clicks save to QR button
        const saveToQRButton = page.getByTestId('save-to-qr-button');
        await saveToQRButton.click();

        // Confirmation modal should open
        const confirmationModal = page.getByTestId('qr-confirmation-modal-content');
        await expect(confirmationModal).toBeVisible();

        // User confirms publishing
        const confirmButton = page.getByTestId('confirm-save-to-qr');
        await confirmButton.click();

        // My notes modal should reopen with QR view button visible
        await expect(myNotesModal).toBeVisible();

        const updatedNoteCard = myNotesModal.getByTestId(selectedNoteTestId);
        await expect(updatedNoteCard).toBeVisible();
        await expect(updatedNoteCard.getByTestId('qr-view-button')).toBeVisible();

        // User clicks QR view button
        const qrViewButton = updatedNoteCard.getByTestId('qr-view-button');
        await qrViewButton.click();

        // QR post should open in new tab
        const [newPage] = await Promise.all([page.waitForEvent('popup'), qrViewButton.click()]);
        await newPage.close();
      },
    );
  });

  test.describe('Note Deletion', () => {
    test(
      'should delete note with confirmation',
      { tag: ['@notes', '@delete-note', '@removal'] },
      async ({ page }) => {
        await switchToTranslationMode(page);
        await openNotesModalFromTranslationView(page);

        const notesOnVerseButton = page.getByTestId('notes-on-verse-button');
        await notesOnVerseButton.click();

        const myNotesModal = page.getByTestId('my-notes-modal-content');
        await expect(myNotesModal).toBeVisible();

        const noteCards = myNotesModal.getByTestId(/^note-card-/);
        const totalNoteCards = await noteCards.count();
        const noteCard = noteCards.first();
        const selectedNoteTestId = await noteCard.getAttribute('data-testid');
        expect(selectedNoteTestId).toBeDefined();

        const deleteButton = noteCard.getByTestId('delete-note-button');
        await deleteButton.click();

        const confirmationButton = page.getByTestId('confirmation-modal-confirm-button');
        await confirmationButton.click();
        await expect(confirmationButton).toBeHidden();

        // Wait for the note to be deleted and the modal to update
        await page.waitForTimeout(5000);

        await expect(myNotesModal).toBeVisible();
        await expect(myNotesModal.getByTestId(selectedNoteTestId)).toBeHidden();
        const updatedNoteCards = await noteCards.count();
        expect(updatedNoteCards).toBe(totalNoteCards - 1);
      },
    );
  });
});
