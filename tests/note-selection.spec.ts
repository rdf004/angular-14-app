import { test, expect } from '@playwright/test';
import { NotesAppPage } from './pages/notes-app.page';
import { NoteListPage } from './pages/note-list.page';
import { NoteEditorPage } from './pages/note-editor.page';

test.describe('Note Selection', () => {
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

  test('should select note by clicking in sidebar', async () => {
    await noteList.selectNoteByTitle('First Note');
    
    expect(await noteList.isNoteSelected('First Note')).toBe(true);
    expect(await noteList.getSelectedNoteTitle()).toBe('First Note');
    
    expect(await noteEditor.getTitle()).toBe('First Note');
    expect(await noteEditor.getContent()).toBe('Content of first note');
  });

  test('should highlight selected note in sidebar', async () => {
    expect(await noteList.isNoteSelected('Third Note')).toBe(true);
    
    await noteList.selectNoteByTitle('Second Note');
    
    expect(await noteList.isNoteSelected('Second Note')).toBe(true);
    expect(await noteList.isNoteSelected('Third Note')).toBe(false);
  });

  test('should update editor when switching between notes', async () => {
    await noteList.selectNoteByTitle('First Note');
    expect(await noteEditor.getTitle()).toBe('First Note');
    expect(await noteEditor.getContent()).toBe('Content of first note');
    
    await noteList.selectNoteByTitle('Second Note');
    expect(await noteEditor.getTitle()).toBe('Second Note');
    expect(await noteEditor.getContent()).toBe('Content of second note');
    
    await noteList.selectNoteByTitle('Third Note');
    expect(await noteEditor.getTitle()).toBe('Third Note');
    expect(await noteEditor.getContent()).toBe('Content of third note');
  });

  test('should preserve selection after page reload', async () => {
    await noteList.selectNoteByTitle('First Note');
    
    await notesApp.page.reload();
    await notesApp.utils.waitForAngularReady();
    
    expect(await noteList.getSelectedNoteTitle()).toBe('First Note');
    expect(await noteEditor.getTitle()).toBe('First Note');
    expect(await noteEditor.getContent()).toBe('Content of first note');
  });

  test('should handle selection with unsaved changes', async () => {
    await noteList.selectNoteByTitle('First Note');
    await noteEditor.setTitle('Modified First Note');
    
    await noteList.selectNoteByTitle('Second Note');
    
    await notesApp.utils.waitForAutoSave();
    
    await noteList.selectNoteByTitle('Modified First Note');
    expect(await noteEditor.getTitle()).toBe('Modified First Note');
  });

  test('should select note by index', async () => {
    await noteList.selectNoteByIndex(1); // Should select second note in list
    
    const selectedTitle = await noteList.getSelectedNoteTitle();
    expect(['First Note', 'Second Note', 'Third Note']).toContain(selectedTitle);
    
    const editorTitle = await noteEditor.getTitle();
    expect(editorTitle).toBe(selectedTitle);
  });

  test('should handle rapid note switching', async () => {
    await noteList.selectNoteByTitle('First Note');
    await notesApp.page.waitForTimeout(100);
    
    await noteList.selectNoteByTitle('Second Note');
    await notesApp.page.waitForTimeout(100);
    
    await noteList.selectNoteByTitle('Third Note');
    await notesApp.page.waitForTimeout(100);
    
    await noteList.selectNoteByTitle('First Note');
    
    expect(await noteList.getSelectedNoteTitle()).toBe('First Note');
    expect(await noteEditor.getTitle()).toBe('First Note');
  });

  test('should maintain note order in sidebar', async () => {
    const noteTitles = await noteList.getNoteTitles();
    
    expect(noteTitles[0]).toBe('Third Note');
    expect(noteTitles[1]).toBe('Second Note');
    expect(noteTitles[2]).toBe('First Note');
  });

  test('should show correct note count', async () => {
    expect(await noteList.getNoteCount()).toBe(3);
    
    await notesApp.createNewNote();
    expect(await noteList.getNoteCount()).toBe(4);
  });

  test('should handle empty selection gracefully', async () => {
    await noteList.deleteNoteByTitle('Third Note');
    await noteList.deleteNoteByTitle('Second Note');
    await noteList.deleteNoteByTitle('First Note');
    
    expect(await notesApp.isEmptyStateVisible()).toBe(true);
    expect(await noteEditor.isEditorVisible()).toBe(false);
    expect(await noteList.getNoteCount()).toBe(0);
  });
});
