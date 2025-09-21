import { test, expect } from '@playwright/test';
import { NotesAppPage } from './pages/notes-app.page';
import { NoteListPage } from './pages/note-list.page';
import { NoteEditorPage } from './pages/note-editor.page';
import { testNotes } from './fixtures/test-data';

test.describe('Note Editing', () => {
  let notesApp: NotesAppPage;
  let noteList: NoteListPage;
  let noteEditor: NoteEditorPage;

  test.beforeEach(async ({ page }) => {
    notesApp = new NotesAppPage(page);
    noteList = new NoteListPage(page);
    noteEditor = new NoteEditorPage(page);
    
    await notesApp.utils.clearLocalStorage();
    await notesApp.goto();
    await notesApp.createNewNote();
  });

  test('should edit note title with auto-save', async () => {
    const newTitle = 'Updated Note Title';
    
    await noteEditor.setTitle(newTitle);
    
    expect(await noteEditor.getTitle()).toBe(newTitle);
    
    expect(await noteList.getSelectedNoteTitle()).toBe(newTitle);
    
    const notes = await notesApp.utils.getNotesFromStorage();
    expect(notes[0].title).toBe(newTitle);
  });

  test('should edit note content with auto-save', async () => {
    const newContent = 'This is the updated content of the note.';
    
    await noteEditor.setContent(newContent);
    
    expect(await noteEditor.getContent()).toBe(newContent);
    
    const preview = await noteList.getNotePreview(0);
    expect(preview).toContain('This is the updated content');
    
    const notes = await notesApp.utils.getNotesFromStorage();
    expect(notes[0].content).toBe(newContent);
  });

  test('should handle Enter key navigation from title to content', async () => {
    await noteEditor.focusTitle();
    await noteEditor.pressEnterInTitle();
    
    await expect(noteEditor.contentEditor).toBeFocused();
  });

  test('should handle Tab key in content editor', async () => {
    const initialContent = 'Line 1\n';
    const expectedContent = 'Line 1\n\tIndented line';
    
    await noteEditor.setContent(initialContent);
    await noteEditor.focusContent();
    await notesApp.page.keyboard.press('End');
    
    await noteEditor.contentEditor.type('Indented line');
    await notesApp.page.keyboard.press('Home'); // Go to beginning of line
    await noteEditor.pressTabInContent();
    
    const content = await noteEditor.getContent();
    expect(content).toContain('\t');
  });

  test('should update preview text in sidebar during editing', async () => {
    const testContent = testNotes[0].content;
    
    await noteEditor.setContent(testContent);
    
    const preview = await noteList.getNotePreview(0);
    expect(preview.length).toBeLessThanOrEqual(63); // 60 chars + "..."
    expect(preview).toContain(testContent.substring(0, 20));
  });

  test('should handle empty title fallback to "Untitled"', async () => {
    await noteEditor.clearTitle();
    
    expect(await noteList.getSelectedNoteTitle()).toBe('Untitled');
    
    const notes = await notesApp.utils.getNotesFromStorage();
    expect(notes[0].title).toBe('Untitled');
  });

  test('should handle special characters in title and content', async () => {
    const specialTitle = testNotes[2].title;
    const specialContent = testNotes[2].content;
    
    await noteEditor.setTitle(specialTitle);
    await noteEditor.setContent(specialContent);
    
    expect(await noteEditor.getTitle()).toBe(specialTitle);
    expect(await noteEditor.getContent()).toBe(specialContent);
    
    expect(await noteList.getSelectedNoteTitle()).toBe(specialTitle);
    
    const notes = await notesApp.utils.getNotesFromStorage();
    expect(notes[0].title).toBe(specialTitle);
    expect(notes[0].content).toBe(specialContent);
  });

  test('should handle long content editing', async () => {
    const longContent = testNotes[3].content;
    
    await noteEditor.setContent(longContent);
    
    expect(await noteEditor.getContent()).toBe(longContent);
    
    const preview = await noteList.getNotePreview(0);
    expect(preview.length).toBeLessThanOrEqual(63);
    expect(preview.endsWith('...')).toBe(true);
  });

  test('should preserve edits after page reload', async () => {
    const title = 'Persistent Edit Test';
    const content = 'This edit should survive page reload.';
    
    await noteEditor.setTitle(title);
    await noteEditor.setContent(content);
    
    await notesApp.page.reload();
    await notesApp.utils.waitForAngularReady();
    
    expect(await noteEditor.getTitle()).toBe(title);
    expect(await noteEditor.getContent()).toBe(content);
    expect(await noteList.getSelectedNoteTitle()).toBe(title);
  });

  test('should handle rapid typing with auto-save debouncing', async () => {
    await noteEditor.focusTitle();
    await noteEditor.titleInput.type('Rapid');
    await notesApp.page.waitForTimeout(100);
    await noteEditor.titleInput.type(' Typing');
    await notesApp.page.waitForTimeout(100);
    await noteEditor.titleInput.type(' Test');
    
    await notesApp.utils.waitForAutoSave();
    
    expect(await noteEditor.getTitle()).toBe('UntitledRapid Typing Test');
    
    const notes = await notesApp.utils.getNotesFromStorage();
    expect(notes[0].title).toBe('UntitledRapid Typing Test');
  });

  test('should display correct placeholders', async () => {
    expect(await noteEditor.getTitlePlaceholder()).toBe('Untitled');
    
    expect(await noteEditor.getContentPlaceholder()).toBe('Start writing...');
  });

  test('should show format hint', async () => {
    expect(await noteEditor.isFormatHintVisible()).toBe(true);
    
    await expect(noteEditor.formatHint).toContainText('Plain text editor');
    await expect(noteEditor.formatHint).toContainText('Tab');
  });
});
