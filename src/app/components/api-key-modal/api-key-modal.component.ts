import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChatGptService } from '../../services/chatgpt.service';

@Component({
  selector: 'app-api-key-modal',
  templateUrl: './api-key-modal.component.html',
  styleUrls: ['./api-key-modal.component.css']
})
export class ApiKeyModalComponent {
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();

  apiKey: string = '';
  showApiKey: boolean = false;

  constructor(private chatGptService: ChatGptService) {
    // Load existing API key if available
    this.apiKey = localStorage.getItem('openai-api-key') || '';
  }

  onSave(): void {
    if (this.apiKey.trim()) {
      this.chatGptService.setApiKey(this.apiKey.trim());
    }
    this.onClose();
  }

  onRemove(): void {
    this.apiKey = '';
    localStorage.removeItem('openai-api-key');
    this.onClose();
  }

  onClose(): void {
    this.close.emit();
  }

  toggleShowApiKey(): void {
    this.showApiKey = !this.showApiKey;
  }

  get hasApiKey(): boolean {
    return this.chatGptService.hasApiKey();
  }
}
