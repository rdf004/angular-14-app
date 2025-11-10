import { test, expect } from '@playwright/test';
import { NotesAppPage } from './pages/notes-app.page';
import { NoteListPage } from './pages/note-list.page';
import { NoteEditorPage } from './pages/note-editor.page';

test.describe('Note Deletion', () => {
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
    await noteEditor.setTitle('First Note');
    await noteEditor.setContent('Content of first note');
    
    await notesApp.createNewNote();
    await noteEditor.setTitle('Second Note');
    await noteEditor.setContent('Content of second note');
    
    await notesApp.createNewNote();
    await noteEditor.setTitle('Third Note');
    await noteEditor.setContent('Content of third note');
  });

  test('should show delete button on hover', async ({ page }) => {
    const noteItem = noteList.noteItems.first();
    const deleteButton = noteItem.locator('.delete-btn');
    
    const initialOpacity = await deleteButton.evaluate(el => window.getComputedStyle(el).opacity);
    expect(parseFloat(initialOpacity)).toBeLessThan(1);
    
    await noteItem.hover();
    await page.waitForTimeout(200);
    
    const hoverOpacity = await deleteButton.evaluate(el => window.getComputedStyle(el).opacity);
    expect(parseFloat(hoverOpacity)).toBe(1);
  });

  test('should delete note with confirmation', async ({ page }) => {
    const initialCount = await noteList.getNoteCount();
    
    await noteList.deleteNoteByTitle('Third Note');
    
    expect(await noteList.getNoteCount()).toBe(initialCount - 1);
    
    const noteTitles = await noteList.getNoteTitles();
    expect(noteTitles).not.toContain('Third Note');
  });

  test('should cancel deletion when confirmation is rejected', async ({ page }) => {
    const initialCount = await noteList.getNoteCount();
    
    const noteItem = noteList.noteItems.first();
    await noteItem.hover();
    await page.waitForTimeout(200);
    
    const deleteButton = noteItem.locator('.delete-btn');
    await deleteButton.click();
    
    const modal = page.locator('app-delete-confirmation-modal');
    await modal.waitFor({ state: 'visible', timeout: 2000 });
    
    const cancelButton = modal.locator('.btn-cancel');
    await cancelButton.click();
    
    await page.waitForTimeout(100);
    
    expect(await noteList.getNoteCount()).toBe(initialCount);
  });

  test('should auto-select next note after deletion', async ({ page }) => {
    await noteList.selectNoteByTitle('Second Note');
    await noteList.deleteNoteByTitle('Second Note');
    
    const selectedTitle = await noteList.getSelectedNoteTitle();
    expect(selectedTitle).not.toBe('Second Note');
    expect(['First Note', 'Third Note']).toContain(selectedTitle);
    
    const editorTitle = await noteEditor.getTitle();
    expect(editorTitle).toBe(selectedTitle);
  });

  test('should handle deletion of last remaining note', async ({ page }) => {
    await noteList.deleteNoteByTitle('Third Note');
    await noteList.deleteNoteByTitle('Second Note');
    await noteList.deleteNoteByTitle('First Note');
    
    expect(await noteList.getNoteCount()).toBe(0);
    expect(await notesApp.isEmptyStateVisible()).toBe(true);
    expect(await noteEditor.isEditorVisible()).toBe(false);
    expect(await noteList.isEmptyListVisible()).toBe(true);
  });

  test('should remove note from localStorage after deletion', async ({ page }) => {
    await noteList.deleteNoteByTitle('Second Note');
    
    const notes = await notesApp.utils.getNotesFromStorage();
    expect(notes).toHaveLength(2);
    
    const titles = notes.map(note => note.title);
    expect(titles).not.toContain('Second Note');
    expect(titles).toContain('First Note');
    expect(titles).toContain('Third Note');
  });

  test('should handle deletion by index', async ({ page }) => {
    const initialTitles = await noteList.getNoteTitles();
    const titleToDelete = initialTitles[1];
    
    await noteList.deleteNoteByIndex(1);
    
    expect(await noteList.getNoteCount()).toBe(2);
    
    const remainingTitles = await noteList.getNoteTitles();
    expect(remainingTitles).not.toContain(titleToDelete);
  });

  test('should persist deletion after page reload', async ({ page }) => {
    await noteList.deleteNoteByTitle('Second Note');
    
    await notesApp.page.reload();
    await notesApp.utils.waitForAngularReady();
    
    expect(await noteList.getNoteCount()).toBe(2);
    
    const noteTitles = await noteList.getNoteTitles();
    expect(noteTitles).not.toContain('Second Note');
    expect(noteTitles).toContain('First Note');
    expect(noteTitles).toContain('Third Note');
  });

  test('should handle rapid deletions', async ({ page }) => {
    await noteList.deleteNoteByTitle('Third Note');
    await page.waitForTimeout(100);
    await noteList.deleteNoteByTitle('Second Note');
    
    expect(await noteList.getNoteCount()).toBe(1);
    expect(await noteList.getSelectedNoteTitle()).toBe('First Note');
  });

  test('should prevent event bubbling when clicking delete button', async ({ page }) => {
    await noteList.selectNoteByTitle('First Note');
    
    const thirdNoteItem = page.locator('.note-item', { hasText: 'Third Note' });
    await thirdNoteItem.hover();
    await page.waitForTimeout(200);
    
    const deleteButton = thirdNoteItem.locator('.delete-btn');
    await deleteButton.click();
    
    const modal = page.locator('app-delete-confirmation-modal');
    await modal.waitFor({ state: 'visible', timeout: 2000 });
    
    const confirmButton = modal.locator('.btn-delete');
    await confirmButton.click();
    
    await page.waitForTimeout(100);
    
    expect(await noteList.getNoteCount()).toBe(2);
    const noteTitles = await noteList.getNoteTitles();
    expect(noteTitles).not.toContain('Third Note');
    
    const selectedTitle = await noteList.getSelectedNoteTitle();
    expect(['First Note', 'Second Note']).toContain(selectedTitle);
  });
});
