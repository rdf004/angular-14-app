import { test, expect } from '@playwright/test';
import { NotesAppPage } from './pages/notes-app.page';
import { NoteListPage } from './pages/note-list.page';
import { NoteEditorPage } from './pages/note-editor.page';
import { testNotes, STORAGE_KEY } from './fixtures/test-data';

test.describe('Local Storage Persistence', () => {
  let notesApp: NotesAppPage;
  let noteList: NoteListPage;
  let noteEditor: NoteEditorPage;

  test.beforeEach(async ({ page }) => {
    notesApp = new NotesAppPage(page);
    noteList = new NoteListPage(page);
    noteEditor = new NoteEditorPage(page);
    
    await notesApp.utils.clearLocalStorage();
  });

  test('should load notes from localStorage on app start', async () => {
    const testNotesData = [
      {
        id: 'test1',
        title: testNotes[0].title,
        content: testNotes[0].content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'test2',
        title: testNotes[1].title,
        content: testNotes[1].content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    await notesApp.utils.setNotesInStorage(testNotesData);
    
    await notesApp.goto();
    
    expect(await noteList.getNoteCount()).toBe(2);
    
    const noteTitles = await noteList.getNoteTitles();
    expect(noteTitles).toContain(testNotes[0].title);
    expect(noteTitles).toContain(testNotes[1].title);
    
    const selectedTitle = await noteList.getSelectedNoteTitle();
    expect([testNotes[0].title, testNotes[1].title]).toContain(selectedTitle);
  });

  test('should save new notes to localStorage', async () => {
    await notesApp.goto();
    
    await notesApp.createNewNote();
    await noteEditor.setTitle('Storage Test Note');
    await noteEditor.setContent('This note should be saved to localStorage');
    
    const notes = await notesApp.utils.getNotesFromStorage();
    expect(notes).toHaveLength(1);
    expect(notes[0].title).toBe('Storage Test Note');
    expect(notes[0].content).toBe('This note should be saved to localStorage');
    expect(notes[0].id).toBeDefined();
    expect(notes[0].createdAt).toBeDefined();
    expect(notes[0].updatedAt).toBeDefined();
  });

  test('should update existing notes in localStorage', async () => {
    await notesApp.goto();
    
    await notesApp.createNewNote();
    await noteEditor.setTitle('Original Title');
    await noteEditor.setContent('Original content');
    
    const originalNotes = await notesApp.utils.getNotesFromStorage();
    const originalCreatedAt = originalNotes[0].createdAt;
    
    await noteEditor.setTitle('Updated Title');
    await noteEditor.setContent('Updated content');
    
    const updatedNotes = await notesApp.utils.getNotesFromStorage();
    expect(updatedNotes).toHaveLength(1);
    expect(updatedNotes[0].title).toBe('Updated Title');
    expect(updatedNotes[0].content).toBe('Updated content');
    expect(updatedNotes[0].createdAt).toBe(originalCreatedAt); // Should not change
    expect(updatedNotes[0].updatedAt).not.toBe(originalCreatedAt); // Should be updated
  });

  test('should remove deleted notes from localStorage', async ({ page }) => {
    await notesApp.goto();
    
    await notesApp.createNewNote();
    await noteEditor.setTitle('Note 1');
    
    await notesApp.createNewNote();
    await noteEditor.setTitle('Note 2');
    
    await notesApp.createNewNote();
    await noteEditor.setTitle('Note 3');
    
    let notes = await notesApp.utils.getNotesFromStorage();
    expect(notes).toHaveLength(3);
    
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    await noteList.deleteNoteByTitle('Note 2');
    
    notes = await notesApp.utils.getNotesFromStorage();
    expect(notes).toHaveLength(2);
    
    const titles = notes.map(note => note.title);
    expect(titles).not.toContain('Note 2');
    expect(titles).toContain('Note 1');
    expect(titles).toContain('Note 3');
  });

  test('should persist notes across page reloads', async () => {
    await notesApp.goto();
    
    await notesApp.createNewNote();
    await noteEditor.setTitle('Persistent Note 1');
    await noteEditor.setContent('Content that should persist');
    
    await notesApp.createNewNote();
    await noteEditor.setTitle('Persistent Note 2');
    await noteEditor.setContent('Another persistent note');
    
    await notesApp.page.reload();
    await notesApp.utils.waitForAngularReady();
    
    expect(await noteList.getNoteCount()).toBe(2);
    
    const noteTitles = await noteList.getNoteTitles();
    expect(noteTitles).toContain('Persistent Note 1');
    expect(noteTitles).toContain('Persistent Note 2');
    
    await noteList.selectNoteByTitle('Persistent Note 1');
    expect(await noteEditor.getContent()).toBe('Content that should persist');
  });

  test('should handle corrupted localStorage gracefully', async () => {
    await notesApp.page.evaluate((storageKey) => {
      localStorage.setItem(storageKey, 'invalid json data');
    }, STORAGE_KEY);
    
    await notesApp.goto();
    
    expect(await notesApp.isEmptyStateVisible()).toBe(true);
    expect(await noteList.getNoteCount()).toBe(0);
    
    await notesApp.createNewNote();
    await noteEditor.setTitle('Recovery Test');
    
    expect(await noteList.getNoteCount()).toBe(1);
    expect(await noteList.getSelectedNoteTitle()).toBe('Recovery Test');
  });

  test('should handle missing localStorage data', async () => {
    await notesApp.utils.clearLocalStorage();
    
    await notesApp.goto();
    
    expect(await notesApp.isEmptyStateVisible()).toBe(true);
    expect(await noteList.getNoteCount()).toBe(0);
    expect(await noteList.isEmptyListVisible()).toBe(true);
  });

  test('should preserve note order in localStorage', async () => {
    await notesApp.goto();
    
    await notesApp.createNewNote();
    await noteEditor.setTitle('First Note');
    
    await notesApp.createNewNote();
    await noteEditor.setTitle('Second Note');
    
    await notesApp.createNewNote();
    await noteEditor.setTitle('Third Note');
    
    const notes = await notesApp.utils.getNotesFromStorage();
    expect(notes[0].title).toBe('Third Note');
    expect(notes[1].title).toBe('Second Note');
    expect(notes[2].title).toBe('First Note');
  });

  test('should handle large amounts of data', async () => {
    await notesApp.goto();
    
    const largeContent = 'A'.repeat(10000); // 10KB of text
    
    await notesApp.createNewNote();
    await noteEditor.setTitle('Large Content Note');
    await noteEditor.setContent(largeContent);
    
    const notes = await notesApp.utils.getNotesFromStorage();
    expect(notes[0].content).toBe(largeContent);
    expect(notes[0].content.length).toBe(10000);
    
    await notesApp.page.reload();
    await notesApp.utils.waitForAngularReady();
    
    expect(await noteEditor.getContent()).toBe(largeContent);
  });

  test('should maintain data integrity during rapid operations', async () => {
    await notesApp.goto();
    
    for (let i = 1; i <= 5; i++) {
      await notesApp.createNewNote();
      await noteEditor.setTitle(`Rapid Note ${i}`);
      await noteEditor.setContent(`Content ${i}`);
    }
    
    const notes = await notesApp.utils.getNotesFromStorage();
    expect(notes).toHaveLength(5);
    
    for (let i = 1; i <= 5; i++) {
      const note = notes.find(n => n.title === `Rapid Note ${i}`);
      expect(note).toBeDefined();
      expect(note?.content).toBe(`Content ${i}`);
    }
  });
});
