import { test, expect } from '@playwright/test';
import { NotesAppPage } from './pages/notes-app.page';
import { NoteListPage } from './pages/note-list.page';
import { NoteEditorPage } from './pages/note-editor.page';

test.describe('Note Creation', () => {
  let notesApp: NotesAppPage;
  let noteList: NoteListPage;
  let noteEditor: NoteEditorPage;

  test.beforeEach(async ({ page }) => {
    notesApp = new NotesAppPage(page);
    noteList = new NoteListPage(page);
    noteEditor = new NoteEditorPage(page);
    
    await notesApp.utils.clearLocalStorage();
    await notesApp.goto();
  });

  test('should display empty state when no notes exist', async () => {
    expect(await notesApp.isEmptyStateVisible()).toBe(true);
    expect(await noteList.isEmptyListVisible()).toBe(true);
    expect(await noteList.getNoteCount()).toBe(0);
    
    await expect(notesApp.emptyState).toContainText('Select a note to start writing');
    await expect(notesApp.createFirstNoteButton).toBeVisible();
  });

  test('should create new note via header button', async () => {
    await notesApp.createNewNote();
    
    expect(await noteList.getNoteCount()).toBe(1);
    expect(await notesApp.isEmptyStateVisible()).toBe(false);
    expect(await noteEditor.isEditorVisible()).toBe(true);
    
    expect(await noteEditor.getTitle()).toBe('Untitled');
    expect(await noteEditor.getContent()).toBe('');
    
    const noteTitles = await noteList.getNoteTitles();
    expect(noteTitles).toContain('Untitled');
  });

  test('should create first note via empty state button', async () => {
    await notesApp.createFirstNote();
    
    expect(await noteList.getNoteCount()).toBe(1);
    expect(await notesApp.isEmptyStateVisible()).toBe(false);
    expect(await noteEditor.isEditorVisible()).toBe(true);
    
    expect(await noteEditor.getTitle()).toBe('Untitled');
    expect(await noteList.getSelectedNoteTitle()).toBe('Untitled');
  });

  test('should create multiple notes', async () => {
    await notesApp.createNewNote();
    await noteEditor.setTitle('First Note');
    
    await notesApp.createNewNote();
    await noteEditor.setTitle('Second Note');
    
    await notesApp.createNewNote();
    await noteEditor.setTitle('Third Note');
    
    expect(await noteList.getNoteCount()).toBe(3);
    const noteTitles = await noteList.getNoteTitles();
    expect(noteTitles).toContain('First Note');
    expect(noteTitles).toContain('Second Note');
    expect(noteTitles).toContain('Third Note');
    
    expect(await noteList.getSelectedNoteTitle()).toBe('Third Note');
  });

  test('should auto-select new note when created', async () => {
    await notesApp.createNewNote();
    
    expect(await noteList.getSelectedNoteTitle()).toBe('Untitled');
    expect(await noteEditor.isEditorVisible()).toBe(true);
    
    await expect(noteEditor.titleInput).toBeFocused();
  });

  test('should persist created notes in localStorage', async () => {
    await notesApp.createNewNote();
    await noteEditor.setTitle('Persistent Note');
    await noteEditor.setContent('This note should persist');
    
    const notes = await notesApp.utils.getNotesFromStorage();
    expect(notes).toHaveLength(1);
    expect(notes[0].title).toBe('Persistent Note');
    expect(notes[0].content).toBe('This note should persist');
    
    await notesApp.page.reload();
    await notesApp.utils.waitForAngularReady();
    
    expect(await noteList.getNoteCount()).toBe(1);
    expect(await noteList.getSelectedNoteTitle()).toBe('Persistent Note');
    expect(await noteEditor.getTitle()).toBe('Persistent Note');
    expect(await noteEditor.getContent()).toBe('This note should persist');
  });

  test('should handle rapid note creation', async () => {
    for (let i = 1; i <= 5; i++) {
      await notesApp.createNewNote();
      await noteEditor.setTitle(`Rapid Note ${i}`);
    }
    
    expect(await noteList.getNoteCount()).toBe(5);
    
    expect(await noteList.getSelectedNoteTitle()).toBe('Rapid Note 5');
    
    const noteTitles = await noteList.getNoteTitles();
    for (let i = 1; i <= 5; i++) {
      expect(noteTitles).toContain(`Rapid Note ${i}`);
    }
  });
});
