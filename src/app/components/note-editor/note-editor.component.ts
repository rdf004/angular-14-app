import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subject, debounceTime } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Note } from '../../models/note.model';
import { NotesService } from '../../services/notes.service';

@Component({
  selector: 'app-note-editor',
  templateUrl: './note-editor.component.html',
  styleUrls: ['./note-editor.component.css']
})
export class NoteEditorComponent implements OnInit, OnDestroy {
  @Input() note!: Note;
  @ViewChild('titleInput', { static: false }) titleInput!: ElementRef<HTMLInputElement>;
  @ViewChild('contentEditor', { static: false }) contentEditor!: ElementRef<HTMLDivElement>;

  private destroy$ = new Subject<void>();
  private titleChange$ = new Subject<string>();
  private contentChange$ = new Subject<string>();

  currentTitle = '';
  currentContent = '';

  constructor(private notesService: NotesService) {}

  ngOnInit(): void {
    if (this.note) {
      this.currentTitle = this.note.title;
      this.currentContent = this.note.content;
    }

    // Debounce title changes
    this.titleChange$
      .pipe(debounceTime(500), takeUntil(this.destroy$))
      .subscribe(title => {
        this.notesService.updateNote(this.note.id, { title: title.trim() || 'Untitled' });
      });

    // Debounce content changes
    this.contentChange$
      .pipe(debounceTime(500), takeUntil(this.destroy$))
      .subscribe(content => {
        this.notesService.updateNote(this.note.id, { content });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTitleChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.currentTitle = target.value;
    this.titleChange$.next(this.currentTitle);
  }

  onTitleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.focusContent();
    }
  }

  onContentInput(event: Event): void {
    const target = event.target as HTMLDivElement;
    this.currentContent = target.innerHTML;
    this.contentChange$.next(this.currentContent);
  }

  onContentKeyDown(event: KeyboardEvent): void {
    // Handle some basic formatting shortcuts
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'b':
          event.preventDefault();
          this.toggleFormat('bold');
          break;
        case 'i':
          event.preventDefault();
          this.toggleFormat('italic');
          break;
        case 'u':
          event.preventDefault();
          this.toggleFormat('underline');
          break;
      }
    }
  }

  private toggleFormat(command: string): void {
    document.execCommand(command, false);
    this.contentEditor.nativeElement.focus();
  }

  private focusContent(): void {
    if (this.contentEditor) {
      this.contentEditor.nativeElement.focus();
      
      // Place cursor at the end
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(this.contentEditor.nativeElement);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }

  focusTitle(): void {
    setTimeout(() => {
      if (this.titleInput) {
        this.titleInput.nativeElement.focus();
        this.titleInput.nativeElement.select();
      }
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString([], { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
