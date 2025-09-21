import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subject, debounceTime } from 'rxjs';
import { takeUntil } from 'rxjs';
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
  @ViewChild('contentEditor', { static: false }) contentEditor!: ElementRef<HTMLTextAreaElement>;

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

    // Force LTR on initial load
    setTimeout(() => {
      this.forceLTRDirection();
    }, 0);

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

  private forceLTRDirection(): void {
    if (this.titleInput) {
      const titleEl = this.titleInput.nativeElement;
      titleEl.style.direction = 'ltr';
      titleEl.style.textAlign = 'left';
      titleEl.style.unicodeBidi = 'normal';
      titleEl.setAttribute('dir', 'ltr');
    }

    if (this.contentEditor) {
      const contentEl = this.contentEditor.nativeElement;
      contentEl.style.direction = 'ltr';
      contentEl.style.textAlign = 'left';
      contentEl.style.unicodeBidi = 'normal';
      contentEl.setAttribute('dir', 'ltr');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTitleChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    
    // Force LTR direction on the element
    target.style.direction = 'ltr';
    target.style.textAlign = 'left';
    target.style.unicodeBidi = 'normal';
    target.setAttribute('dir', 'ltr');
    
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
    const target = event.target as HTMLTextAreaElement;
    
    // Force LTR direction on the element
    target.style.direction = 'ltr';
    target.style.textAlign = 'left';
    target.style.unicodeBidi = 'normal';
    target.setAttribute('dir', 'ltr');
    
    this.currentContent = target.value;
    this.contentChange$.next(this.currentContent);
  }

  onContentKeyDown(event: KeyboardEvent): void {
    // Basic keyboard shortcuts for textarea
    if (event.key === 'Tab') {
      event.preventDefault();
      const target = event.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      
      // Insert tab character
      target.value = target.value.substring(0, start) + '\t' + target.value.substring(end);
      target.selectionStart = target.selectionEnd = start + 1;
      
      // Trigger change
      this.currentContent = target.value;
      this.contentChange$.next(this.currentContent);
    }
  }

  // Removed toggleFormat since we're using textarea now

  private focusContent(): void {
    if (this.contentEditor) {
      const element = this.contentEditor.nativeElement;
      
      // Force LTR before focusing
      element.style.direction = 'ltr';
      element.style.textAlign = 'left';
      element.style.unicodeBidi = 'normal';
      element.setAttribute('dir', 'ltr');
      
      element.focus();
      
      // Place cursor at the end for textarea
      element.setSelectionRange(element.value.length, element.value.length);
    }
  }

  focusTitle(): void {
    setTimeout(() => {
      if (this.titleInput) {
        const element = this.titleInput.nativeElement;
        
        // Force LTR before focusing
        element.style.direction = 'ltr';
        element.style.textAlign = 'left';
        element.style.unicodeBidi = 'normal';
        element.setAttribute('dir', 'ltr');
        
        element.focus();
        element.select();
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
