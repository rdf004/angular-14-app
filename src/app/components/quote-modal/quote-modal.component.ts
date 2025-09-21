import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NotesService } from '../../services/notes.service';

@Component({
  selector: 'app-quote-modal',
  templateUrl: './quote-modal.component.html',
  styleUrls: ['./quote-modal.component.css']
})
export class QuoteModalComponent {
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();

  currentQuote: string = '';
  isLoading: boolean = false;

  constructor(private notesService: NotesService) {}

  ngOnInit(): void {
    if (this.isOpen) {
      this.generateRandomQuote();
    }
  }

  ngOnChanges(): void {
    if (this.isOpen) {
      this.generateRandomQuote();
    }
  }

  generateRandomQuote(): void {
    this.isLoading = true;
    const quote = this.notesService.getRandomQuote();
    
    setTimeout(() => {
      this.currentQuote = quote;
      this.isLoading = false;
    }, 300);
  }

  onClose(): void {
    this.close.emit();
  }

  onNewQuote(): void {
    this.generateRandomQuote();
  }
}
