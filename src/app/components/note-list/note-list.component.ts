import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Note, NotePreview } from '../../models/note.model';
import { NotesService } from '../../services/notes.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-note-list',
  templateUrl: './note-list.component.html',
  styleUrls: ['./note-list.component.css']
})
export class NoteListComponent implements OnInit {
  notes$: Observable<Note[]>;
  selectedNote$: Observable<Note | null>;
  
  constructor(private notesService: NotesService) {
    this.notes$ = this.notesService.notes$;
    this.selectedNote$ = this.notesService.selectedNote$;
  }

  ngOnInit(): void {}

  onSelectNote(noteId: string): void {
    this.notesService.selectNote(noteId);
  }

  onDeleteNote(event: Event, noteId: string): void {
    event.stopPropagation(); // Prevent note selection
    if (confirm('Are you sure you want to delete this note?')) {
      this.notesService.deleteNote(noteId);
    }
  }

  formatDate(date: Date): string {
    const now = new Date();
    const noteDate = new Date(date);
    const diffInHours = Math.abs(now.getTime() - noteDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return noteDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return noteDate.toLocaleDateString([], { weekday: 'short' });
    } else {
      return noteDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  }

  getPreviewText(content: string): string {
    if (!content) return 'No additional text';
    
    // Strip HTML tags and get first 60 characters for list preview
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    return textContent.length > 60 
      ? textContent.substring(0, 60) + '...'
      : textContent || 'No additional text';
  }

  trackByNoteId(index: number, note: Note): string {
    return note.id;
  }
}
