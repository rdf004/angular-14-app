import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Note, NotePreview } from '../models/note.model';

@Injectable({
  providedIn: 'root'
})
export class NotesService {
  private readonly STORAGE_KEY = 'notes-app-data';
  private notesSubject = new BehaviorSubject<Note[]>([]);
  private selectedNoteSubject = new BehaviorSubject<Note | null>(null);

  public notes$: Observable<Note[]> = this.notesSubject.asObservable();
  public selectedNote$: Observable<Note | null> = this.selectedNoteSubject.asObservable();

  constructor() {
    this.loadNotes();
  }

  private loadNotes(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const notes = JSON.parse(saved).map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt)
        }));
        this.notesSubject.next(notes);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
      this.notesSubject.next([]);
    }
  }

  private saveNotes(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.notesSubject.value));
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  }

  createNote(): string {
    const newNote: Note = {
      id: this.generateId(),
      title: 'Untitled',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const currentNotes = this.notesSubject.value;
    const updatedNotes = [newNote, ...currentNotes];
    
    this.notesSubject.next(updatedNotes);
    this.selectedNoteSubject.next(newNote);
    this.saveNotes();
    
    return newNote.id;
  }

  updateNote(id: string, updates: Partial<Pick<Note, 'title' | 'content'>>): void {
    const currentNotes = this.notesSubject.value;
    const noteIndex = currentNotes.findIndex(note => note.id === id);
    
    if (noteIndex !== -1) {
      const updatedNote: Note = {
        ...currentNotes[noteIndex],
        ...updates,
        updatedAt: new Date()
      };
      
      const updatedNotes = [...currentNotes];
      updatedNotes[noteIndex] = updatedNote;
      
      this.notesSubject.next(updatedNotes);
      
      if (this.selectedNoteSubject.value?.id === id) {
        this.selectedNoteSubject.next(updatedNote);
      }
      
      this.saveNotes();
    }
  }

  deleteNote(id: string): void {
    const currentNotes = this.notesSubject.value;
    const updatedNotes = currentNotes.filter(note => note.id !== id);
    
    this.notesSubject.next(updatedNotes);
    
    if (this.selectedNoteSubject.value?.id === id) {
      const nextNote = updatedNotes.length > 0 ? updatedNotes[0] : null;
      this.selectedNoteSubject.next(nextNote);
    }
    
    this.saveNotes();
  }

  selectNote(id: string): void {
    const note = this.notesSubject.value.find(note => note.id === id);
    this.selectedNoteSubject.next(note || null);
  }

  getNotePreviews(): NotePreview[] {
    return this.notesSubject.value.map(note => ({
      id: note.id,
      title: note.title || 'Untitled',
      preview: this.getPreviewText(note.content),
      createdAt: note.createdAt,
      updatedAt: note.updatedAt
    }));
  }

  private getPreviewText(content: string): string {
    if (!content) return 'No additional text';
    
    // Strip HTML tags and get first 100 characters
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    return textContent.length > 100 
      ? textContent.substring(0, 100) + '...'
      : textContent || 'No additional text';
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
