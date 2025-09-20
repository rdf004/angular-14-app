import { Component, Input, OnInit } from '@angular/core';
import { Note } from '../../models/note.model';
import { ChatGptService } from '../../services/chatgpt.service';

@Component({
  selector: 'app-reflection-pane',
  templateUrl: './reflection-pane.component.html',
  styleUrls: ['./reflection-pane.component.css']
})
export class ReflectionPaneComponent implements OnInit {
  @Input() note: Note | null = null;
  
  reflection: string = '';
  isLoading: boolean = false;
  hasReflection: boolean = false;
  error: string = '';

  constructor(private chatGptService: ChatGptService) {}

  ngOnInit(): void {}

  async onGetReflection(): Promise<void> {
    if (!this.note || (!this.note.title && !this.note.content)) {
      this.error = 'Please write some content in your note first.';
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.reflection = '';

    try {
      const prompt = this.buildReflectionPrompt();
      
      // Use real API if key is available, otherwise use mock
      if (this.chatGptService.hasApiKey()) {
        this.reflection = await this.chatGptService.getReflection(prompt);
      } else {
        this.reflection = await this.chatGptService.getMockReflection(prompt);
      }
      
      this.hasReflection = true;
    } catch (error) {
      console.error('Error getting reflection:', error);
      this.error = 'Unable to get reflection. Please check your API configuration.';
    } finally {
      this.isLoading = false;
    }
  }

  private buildReflectionPrompt(): string {
    const title = this.note?.title || 'Untitled';
    const content = this.note?.content || '';
    
    return `Please help me reflect on this note I wrote:

Title: ${title}

Content: ${content}

Please provide thoughtful reflection questions, insights, or suggestions that could help me think deeper about what I wrote. Focus on:
1. Key themes or patterns you notice
2. Questions that might help me explore the topic further  
3. Different perspectives I might consider
4. Potential next steps or actions

Keep your response concise but meaningful.`;
  }

  onClearReflection(): void {
    this.reflection = '';
    this.hasReflection = false;
    this.error = '';
  }

  get noteHasContent(): boolean {
    return !!(this.note && (this.note.title.trim() || this.note.content.trim()));
  }
}
