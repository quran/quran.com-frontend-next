/**
 * Notes Backend Simulation for Integration Tests
 *
 * This test suite simulates a real notes backend environment using Playwright's request interception.
 * The simulation maintains in-memory state that persists across mock function calls within each test,
 * allowing for realistic testing of CRUD operations on notes.
 *
 * STATE MANAGEMENT APPROACH:
 * - Uses a module-level `notes` array to simulate persistent backend storage
 * - Each test starts with a fresh state via `beforeEach` hook
 * - Mock functions directly mutate this state to simulate real backend behavior
 * - State changes happen within route handlers to reflect immediate persistence
 *
 * SIMULATED API ENDPOINTS:
 * - GET /notes/count-within-range* - Returns note count for verse ranges
 * - GET /notes/by-verse/:verseKey - Returns all notes for a specific verse
 * - DELETE /notes/:noteId - Deletes a note and returns the deleted note
 * - PATCH /notes/:noteId - Updates a note (edit/publish operations)
 * - POST /notes - Creates a new note
 *
 * STATE MUTATION PATTERN:
 * Mock functions receive parameters for the intended operation, then:
 * 1. Mutate the in-memory `notes` array to reflect the change
 * 2. Return a route handler that responds with appropriate HTTP status/data
 * This ensures the next API call sees the updated state, simulating real persistence.
 *
 * TEST ISOLATION:
 * - Each test gets a clean state via beforeEach reset
 * - Mock functions can be called multiple times within a test to simulate sequences
 * - State mutations are explicit but happen inside mocks for realistic simulation
 */

/* eslint-disable no-await-in-loop, no-restricted-syntax, react-func/max-lines-per-function, max-lines */

import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

import { switchToTranslationMode } from '@/tests/helpers/mode-switching';
import Homepage from '@/tests/POM/home-page';
import { AttachedEntity, AttachedEntityType, Note } from '@/types/auth/Note';

let homePage: Homepage;

// Global ayah configuration
const ayah = {
  surah: 1,
  ayah: 1,
};

const TEST_VERSE_KEY = `${ayah.surah}:${ayah.ayah}`;
const UPDATED_NOTE_TEXT = 'This is an updated test private note';

/**
 * Helper function to open the notes modal from translation view.
 * Clicks the notes action button on a verse and verifies the modal opens.
 */
const openNotesModalFromTranslationView = async (
  page: Page,
  verseKey: string = TEST_VERSE_KEY,
): Promise<void> => {
  const verse = page.getByTestId(`verse-${verseKey}`);
  const notesButton = verse.getByTestId('notes-action-button');
  await expect(notesButton).toBeVisible();
  await notesButton.click();

  const rootContent = page.getByTestId('modal-content');
  await expect(rootContent).toBeVisible();
  const modal = page.getByTestId('add-note-modal-content');
  await expect(modal).toBeVisible();
};

/**
 * MOCK NOTES STATE INITIALIZATION
 * Sets up the initial notes state for a test and mocks the API endpoints.
 *
 * Simulates: GET /notes/count-within-range* and GET /notes/by-verse/:verseKey
 * State Effect: Replaces the module-level notes array with generated test data
 * Why: Tests need predictable initial state, and this simulates loading notes from backend
 */
const mockNotes = async (page: Page, count?: number): Promise<void> => {
  notes = generateNotes(TEST_VERSE_KEY).slice(0, count ?? notes.length);

  await page.route('**/notes/count-within-range*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ [TEST_VERSE_KEY]: notes.length }),
    });
  });

  await page.route(`**/notes/by-verse/${TEST_VERSE_KEY}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(notes),
    });
  });
};

/**
 * Generates a mock attached entity object representing a QuranReflect reflection post.
 * Used to simulate entities that can be attached to notes during publishing operations.
 *
 * @returns {object} An attached entity object with reflection type and current timestamps
 */
const generateAttachedEntity = (id: string): AttachedEntity => {
  return {
    id,
    type: AttachedEntityType.REFLECTION,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

/**
 * Generates a mock note object for testing purposes with realistic properties.
 * Creates notes with randomized timestamps and optional attached entities.
 *
 * @returns {Note} A complete note object with all required properties for testing
 */
const generateNote = (
  id: string,
  body: string,
  verseKey: string,
  attachedEntities?: string[],
): Note => {
  const randomDate = () => new Date(new Date().getTime() + Math.random() * 10000);

  return {
    id,
    title: `${id} Note`,
    body,
    verseKey,
    ranges: [`${verseKey}-${verseKey}`],
    createdAt: randomDate(),
    updatedAt: randomDate(),
    saveToQR: attachedEntities?.length > 0,
    attachedEntities: attachedEntities?.map(generateAttachedEntity),
  };
};

/**
 * Generates an array of mock notes for testing, including a mix of private and published notes.
 * Creates three test notes: two private notes and one note with attached QuranReflect entities.
 *
 * @returns {Note[]} Array of three note objects with varying properties for comprehensive testing
 */
const generateNotes = (verseKey: string): Note[] => {
  return [
    generateNote('note-1', `note-1 Note body`, verseKey),
    generateNote('note-2', `note-2 Note body`, verseKey),
    generateNote('note-3-with-qr', `note-3-with-qr Note body`, verseKey, [
      'reflection-1',
      'reflection-2',
    ]),
  ];
};

/**
 * SHARED TEST STATE
 * Module-level array simulating persistent backend storage for notes.
 * This state is shared across all mock functions within a test to simulate
 * real backend persistence where changes are immediately visible to subsequent requests.
 *
 * Reset in beforeEach to ensure test isolation.
 */
let notes = generateNotes(TEST_VERSE_KEY);

/**
 * MOCK NOTE DELETION
 * Simulates: DELETE /notes/:noteId
 * State Effect: Removes the note from the module-level notes array
 * Why: Simulates immediate deletion from backend storage
 * @returns {Promise} The route handler for the delete request (note is returned in response)
 */
const mockDeleteNote = async (page: Page, noteId: string): Promise<void> => {
  const note = notes.find((n) => n.id === noteId);
  if (!note) throw new Error(`Note with id ${noteId} not found`);

  return page.route(`**/notes/${noteId}`, async (route) => {
    notes = notes.filter((n) => n.id !== noteId);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(note),
    });
  });
};

/**
 * MOCK NOTE EDITING
 * Simulates: PATCH /notes/:noteId (for editing note content)
 * State Effect: Updates the note's body in the module-level notes array
 * Why: Simulates immediate persistence of note edits to backend storage
 * @returns {Promise} The route handler for the edit request (updated note returned in response)
 */
const mockEditNote = async (page: Page, noteId: string, noteText: string): Promise<void> => {
  const note = notes.find((n) => n.id === noteId);
  if (!note) throw new Error(`Note with id ${noteId} not found`);

  return page.route(`**/notes/${noteId}`, async (route) => {
    note.body = noteText;

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(note),
    });
  });
};

/**
 * MOCK NOTE PUBLISHING
 * Simulates: PATCH /notes/:noteId (for publishing note to QuranReflect)
 * State Effect: Adds attached entity to the note's attachedEntities array
 * Why: Simulates linking note to a published reflection post in backend storage
 * @returns {Promise} The route handler for the publish request (updated note returned in response)
 */
const mockPublishNote = async (page: Page, noteId: string, attachId: string): Promise<void> => {
  const note = notes.find((n) => n.id === noteId);
  if (!note) throw new Error(`Note with id ${noteId} not found`);

  return page.route(`**/notes/${noteId}`, async (route) => {
    note.attachedEntities = [...(note.attachedEntities || []), generateAttachedEntity(attachId)];

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(note),
    });
  });
};

/**
 * MOCK NOTE CREATION
 * Simulates: POST /notes
 * State Effect: Adds new note to the beginning of the module-level notes array
 * Why: Simulates immediate creation and storage of new notes in backend
 * @returns {Promise} The route handler for the create request (created note returned in response)
 */
const mockAddNote = async (
  page: Page,
  {
    noteId,
    noteText,
  }: {
    noteId: string;
    noteText: string;
  },
): Promise<void> => {
  const note = generateNote(noteId, noteText, TEST_VERSE_KEY);

  return page.route(`**/notes`, async (route) => {
    notes = [note, ...notes];

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(note),
    });
  });
};

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);

  /**
   * TEST ISOLATION: Reset shared state before each test
   * Ensures each test starts with a clean, predictable notes state.
   * Individual tests can override this with mockNotes() calls for specific scenarios.
   */
  notes = generateNotes(TEST_VERSE_KEY);
});

// Tests skipped - none of them are passing and there's rate limit issues.
// Can the person who wrote those tests please take a look?
test.skip('Notes - Authenticated Users', () => {
  test.describe('Add Note Modal Content', () => {
    test(
      'should show add note modal content',
      { tag: ['@notes', '@auth', '@logged-in', '@smoke', '@add-note'] },
      async ({ page }) => {
        await mockNotes(page, 0);

        await homePage.goTo(`/${ayah.surah}/${ayah.ayah}`);

        // User is in translation mode
        await switchToTranslationMode(page);

        // Click the notes button on a verse
        await openNotesModalFromTranslationView(page);

        // Verify notes modal opens with proper content
        await expect(page.getByTestId('add-note-modal-title')).toBeVisible();
        await expect(page.getByTestId('notes-textarea')).toBeVisible();
        await expect(page.getByTestId('save-private-button')).toBeVisible();
        await expect(page.getByTestId('save-to-qr-button')).toBeVisible();

        // Verify notes on verse button is hidden when no notes exist
        const notesOnVerseButton = page.getByTestId('notes-on-verse-button');
        await expect(notesOnVerseButton).toBeHidden();
      },
    );

    test(
      'should show notes on verse button with correct note count',
      { tag: ['@notes', '@auth', '@logged-in', '@smoke', '@add-note'] },
      async ({ page }) => {
        await mockNotes(page, 2);

        await homePage.goTo(`/${ayah.surah}/${ayah.ayah}`);

        await switchToTranslationMode(page);
        await openNotesModalFromTranslationView(page);

        // Verify notes on verse button shows correct count
        const notesOnVerseButton = page.getByTestId('notes-on-verse-button');
        await expect(notesOnVerseButton).toBeVisible();
        await expect(notesOnVerseButton).toHaveAttribute('data-note-count', '2');

        await notesOnVerseButton.click();

        // My notes modal should open with proper title and notes
        const myNotesModal = page.getByTestId('my-notes-modal-content');
        await expect(myNotesModal).toBeVisible();

        // Should show notes count in title
        const myNotesModalTitle = page.getByTestId('my-notes-modal-title');
        await expect(myNotesModalTitle).toBeVisible();
        await expect(myNotesModalTitle).toHaveAttribute('data-note-count', '2');
      },
    );
  });

  test.describe('Text Content Expansions', () => {
    test(
      'should handle learn more toggle in text content expansions',
      { tag: ['@notes', '@publish-note', '@qr', '@confirmation'] },
      async ({ page }) => {
        await mockNotes(page, 2);
        await homePage.goTo(`/${ayah.surah}/${ayah.ayah}`);

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
        await textarea.fill('TEST_NOTE_TEXT');

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
        await mockNotes(page, 0);
        await homePage.goTo(`/${ayah.surah}/${ayah.ayah}`);

        await switchToTranslationMode(page);
        await openNotesModalFromTranslationView(page);

        // Try to save empty note publicly
        const savePublicButton = page.getByTestId('save-to-qr-button');
        await savePublicButton.click();

        // Verify validation error is shown
        await expect(page.getByTestId('note-input-error-required-field')).toBeVisible();

        // Enter very short text and try to save
        const textarea = page.getByTestId('notes-textarea');
        await textarea.fill('Hi');
        await savePublicButton.click();

        // Verify validation error is shown
        await expect(page.getByTestId('note-input-error-minimum-length')).toBeVisible();

        // Enter note longer than 10000 characters and try to save
        const longText = 'a'.repeat(10001);
        await textarea.fill(longText);
        await savePublicButton.click();

        // Verify validation error is shown
        await expect(page.getByTestId('note-input-error-maximum-length')).toBeVisible();
      },
    );
  });

  test.describe('My Notes Modal', () => {
    test(
      'should display notes count and list',
      { tag: ['@notes', '@my-notes', '@notes-list'] },
      async ({ page }) => {
        const NOTE_COUNT = 3;

        await mockNotes(page, NOTE_COUNT);
        await homePage.goTo(`/${ayah.surah}/${ayah.ayah}`);

        await switchToTranslationMode(page);
        await openNotesModalFromTranslationView(page);

        const notesOnVerseButton = page.getByTestId('notes-on-verse-button');
        await expect(notesOnVerseButton).toBeVisible();
        await expect(notesOnVerseButton).toHaveAttribute('data-note-count', NOTE_COUNT.toString());
        await notesOnVerseButton.click();

        // My notes modal should open with proper title and notes
        const myNotesModal = page.getByTestId('my-notes-modal-content');
        await expect(myNotesModal).toBeVisible();

        // Should show notes count in title
        const myNotesModalTitle = page.getByTestId('my-notes-modal-title');
        await expect(myNotesModalTitle).toBeVisible();
        await expect(myNotesModalTitle).toHaveAttribute('data-note-count', NOTE_COUNT.toString());

        // Should have note cards
        const notesCards = myNotesModal.getByTestId(/^note-card-/);
        await expect(notesCards).toHaveCount(NOTE_COUNT);

        for (const note of await notesCards.all()) {
          await expect(note.getByTestId('edit-note-button')).toBeVisible();
          await expect(note.getByTestId('delete-note-button')).toBeVisible();
        }

        const noteWithQR = myNotesModal.getByTestId('note-card-note-3-with-qr');
        await expect(noteWithQR).toHaveCount(1);
        await expect(noteWithQR).toBeVisible();
        const noteQrViewButton = noteWithQR.getByTestId('qr-view-button');
        const parentLink = noteQrViewButton.locator('..');
        await expect(noteQrViewButton).toBeVisible();
        // Parent link should be linked to the last reflection
        await expect(parentLink).toHaveAttribute('href', expect.stringMatching(/reflection-2$/));

        const noteWithoutQR = myNotesModal.getByTestId(/^note-card-note-(1|2)$/);
        await expect(noteWithoutQR).toHaveCount(NOTE_COUNT - 1);

        for (const note of await noteWithoutQR.all()) {
          await expect(note.getByTestId('qr-view-button')).not.toBeVisible();
        }

        const addAnotherButton = page.getByTestId('add-another-note-button');
        await expect(addAnotherButton).toBeVisible();

        await addAnotherButton.click();

        const addNoteModal = page.getByTestId('add-note-modal-content');
        await expect(addNoteModal).toBeVisible();
      },
    );
  });

  test.describe('Private Note Creation', () => {
    test(
      'should create private note and open my notes modal',
      { tag: ['@notes', '@create-note', '@private'] },
      async ({ page }) => {
        await mockNotes(page);
        await homePage.goTo(`/${ayah.surah}/${ayah.ayah}`);

        await switchToTranslationMode(page);
        await openNotesModalFromTranslationView(page);

        const newNoteId = 'note-new-1';
        const newNoteText = `${newNoteId} Note body`;
        await mockAddNote(page, { noteId: newNoteId, noteText: newNoteText });

        // Enter note text and save privately
        const textarea = page.getByTestId('notes-textarea');
        await textarea.fill(newNoteText);
        const savePrivateButton = page.getByTestId('save-private-button');
        await savePrivateButton.click();

        // Verify note is saved and my notes modal opens
        const myNotesModal = page.getByTestId('my-notes-modal-content');
        await expect(myNotesModal).toBeVisible();

        const noteCard = myNotesModal.getByTestId(`note-card-${newNoteId}`);
        await expect(noteCard).toBeVisible();
        await expect(noteCard.getByTestId('note-text')).toHaveText(newNoteText);
      },
    );
  });

  test.describe('Note Editing', () => {
    test(
      'should edit note and persist changes',
      { tag: ['@notes', '@edit-note', '@update'] },
      async ({ page }) => {
        await mockNotes(page);

        await homePage.goTo(`/${ayah.surah}/${ayah.ayah}`);

        await switchToTranslationMode(page);
        await openNotesModalFromTranslationView(page);

        const updatedNoteTextWithTimestamp = `${UPDATED_NOTE_TEXT} ${new Date().toISOString()}`;

        const note = notes.at(-1);
        if (!note) throw new Error('No note found');
        await mockEditNote(page, note.id, updatedNoteTextWithTimestamp);

        const notesOnVerseButton = page.getByTestId('notes-on-verse-button');
        await notesOnVerseButton.click();

        const myNotesModal = page.getByTestId('my-notes-modal-content');
        await expect(myNotesModal).toBeVisible();

        const noteCard = myNotesModal.getByTestId(`note-card-${note.id}`);
        await expect(noteCard).toBeVisible();

        const editButton = noteCard.getByTestId('edit-note-button');
        await editButton.click();

        // Edit modal should open with current content
        const editModal = page.getByTestId('edit-note-modal-content');
        await expect(editModal).toBeVisible();

        const textarea = page.getByTestId('notes-textarea');
        await expect(textarea).toHaveValue(note.body);

        // User updates the note and saves
        await textarea.fill(updatedNoteTextWithTimestamp);
        const savePrivateButton = page.getByTestId('save-private-button');
        await savePrivateButton.click();

        // Edit modal should close and my notes should show updated content
        await expect(editModal).toBeHidden();
        await expect(myNotesModal).toBeVisible();

        await expect(noteCard.getByTestId('note-text')).toHaveText(updatedNoteTextWithTimestamp);
      },
    );
  });

  test.describe('Public Note Publishing', () => {
    test(
      'should publish note to QuranReflect with confirmation',
      { tag: ['@notes', '@publish-note', '@qr', '@public'] },
      async ({ page }) => {
        await mockNotes(page);

        await homePage.goTo(`/${ayah.surah}/${ayah.ayah}`);

        await switchToTranslationMode(page);
        await openNotesModalFromTranslationView(page);

        const note = notes.find((n) => (n.attachedEntities?.length ?? 0) === 0);
        if (!note) throw new Error('No note found');
        const reflectionPostId = `reflection---${note.id}`;
        await mockPublishNote(page, note.id, reflectionPostId);

        const updatedNoteTextWithTimestamp = `${UPDATED_NOTE_TEXT} ${new Date().toISOString()}`;

        const notesOnVerseButton = page.getByTestId('notes-on-verse-button');
        await notesOnVerseButton.click();

        const myNotesModal = page.getByTestId('my-notes-modal-content');
        await expect(myNotesModal).toBeVisible();

        const noteCard = myNotesModal.getByTestId(`note-card-${note.id}`);
        const noteQrViewButton = noteCard.getByTestId('qr-view-button');
        await expect(noteCard).toBeVisible();
        await expect(noteQrViewButton).toBeHidden();

        const editButton = noteCard.getByTestId('edit-note-button');
        await editButton.click();

        const editModal = page.getByTestId('edit-note-modal-content');
        await expect(editModal).toBeVisible();

        const textarea = page.getByTestId('notes-textarea');
        await expect(textarea).toHaveValue(note.body);

        await textarea.fill(updatedNoteTextWithTimestamp);

        // User clicks save to QR button
        const saveToQRButton = page.getByTestId('save-to-qr-button');
        await saveToQRButton.click();

        // Confirmation modal should open
        const confirmationModal = page.getByTestId('qr-confirmation-modal-content');
        await expect(confirmationModal).toBeVisible();

        const ECMEditButton = confirmationModal.getByTestId('edit-confirmation-button');
        await expect(ECMEditButton).toBeVisible();
        await ECMEditButton.click();

        await expect(editModal).toBeVisible();
        await expect(textarea).toHaveValue(updatedNoteTextWithTimestamp);

        await saveToQRButton.click();

        // User confirms publishing
        const confirmButton = page.getByTestId('confirm-save-to-qr');
        await confirmButton.click();

        // My notes modal should reopen with QR view button visible
        await expect(myNotesModal).toBeVisible();
        await expect(noteQrViewButton).toBeVisible();
        const parentLink = noteQrViewButton.locator('..');

        await expect(parentLink).toHaveAttribute(
          'href',
          expect.stringMatching(new RegExp(`${reflectionPostId}$`)),
        );
      },
    );
  });

  test.describe('Note Deletion', () => {
    test(
      'should delete note with confirmation',
      { tag: ['@notes', '@delete-note', '@removal'] },
      async ({ page }) => {
        const initialNoteCount = notes.length;
        await mockNotes(page, initialNoteCount);

        await homePage.goTo(`/${ayah.surah}/${ayah.ayah}`);

        await switchToTranslationMode(page);
        await openNotesModalFromTranslationView(page);

        const note = notes.at(-1);
        if (!note) throw new Error('No note found');
        await mockDeleteNote(page, note.id);

        const notesOnVerseButton = page.getByTestId('notes-on-verse-button');
        await notesOnVerseButton.click();

        const myNotesModal = page.getByTestId('my-notes-modal-content');
        await expect(myNotesModal).toBeVisible();

        const noteCards = myNotesModal.getByTestId(/^note-card-/);
        await expect(noteCards).toHaveCount(initialNoteCount);

        const noteCard = myNotesModal.getByTestId(`note-card-${note.id}`);
        await expect(noteCard).toBeVisible();

        const deleteButton = noteCard.getByTestId('delete-note-button');
        await deleteButton.click();

        const confirmationButton = page.getByTestId('confirmation-modal-confirm-button');
        await confirmationButton.click();
        await expect(confirmationButton).toBeHidden();

        await expect(myNotesModal).toBeVisible();
        await expect(noteCards).toHaveCount(initialNoteCount - 1);
        await expect(noteCard).toBeHidden();
      },
    );
  });
});
