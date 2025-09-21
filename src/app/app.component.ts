import { Component, OnInit } from '@angular/core';
import { NotesService } from './services/notes.service';
import { Note } from './models/note.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  selectedNote$: Observable<Note | null>;
  showApiKeyModal: boolean = false;
  showQuoteModal: boolean = false;
  
  constructor(private notesService: NotesService) {
    this.selectedNote$ = this.notesService.selectedNote$;
  }

  ngOnInit(): void {
    // Initialize with first note if available
    this.notesService.notes$.subscribe(notes => {
      if (notes.length > 0 && !this.notesService.selectedNote$) {
        this.notesService.selectNote(notes[0].id);
      }
    });
  }

  onCreateNewNote(): void {
    this.notesService.createNote();
  }

  onOpenApiKeyModal(): void {
    this.showApiKeyModal = true;
  }

  onCloseApiKeyModal(): void {
    this.showApiKeyModal = false;
  }

  onOpenQuoteModal(): void {
    this.showQuoteModal = true;
  }

  onCloseQuoteModal(): void {
    this.showQuoteModal = false;
  }
}
