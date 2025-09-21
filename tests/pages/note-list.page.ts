import { Page, Locator } from '@playwright/test';
import { TestUtils } from '../fixtures/test-utils';

export class NoteListPage {
  readonly page: Page;
  readonly utils: TestUtils;
  
  readonly noteListContainer: Locator;
  readonly noteCount: Locator;
  readonly noteItems: Locator;
  readonly emptyListState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.utils = new TestUtils(page);
    
    this.noteListContainer = page.locator('.note-list-container');
    this.noteCount = page.locator('.note-count');
    this.noteItems = page.locator('.note-item');
    this.emptyListState = page.locator('.empty-list');
  }

  async getNoteCount(): Promise<number> {
    return await this.utils.getNoteCount();
  }

  async getNoteItems(): Promise<Locator[]> {
    await this.noteItems.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    const count = await this.noteItems.count();
    const items: Locator[] = [];
    for (let i = 0; i < count; i++) {
      items.push(this.noteItems.nth(i));
    }
    return items;
  }

  async selectNoteByIndex(index: number): Promise<void> {
    const noteItem = this.noteItems.nth(index);
    await noteItem.click();
    await this.page.waitForTimeout(100); // Wait for selection to update
  }

  async selectNoteByTitle(title: string): Promise<void> {
    const noteItem = this.page.locator('.note-item', { hasText: title });
    await noteItem.click();
    await this.page.waitForTimeout(100);
  }

  async deleteNoteByIndex(index: number): Promise<void> {
    const noteItem = this.noteItems.nth(index);
    
    await noteItem.hover();
    await this.page.waitForTimeout(200); // Wait for hover effect
    
    const deleteButton = noteItem.locator('.delete-btn');
    await deleteButton.click();
    
    this.page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    await this.page.waitForTimeout(100); // Wait for deletion to complete
  }

  async deleteNoteByTitle(title: string): Promise<void> {
    const noteItem = this.page.locator('.note-item', { hasText: title });
    
    await noteItem.hover();
    await this.page.waitForTimeout(200);
    
    const deleteButton = noteItem.locator('.delete-btn');
    await deleteButton.click();
    
    this.page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    await this.page.waitForTimeout(100);
  }

  async getSelectedNoteTitle(): Promise<string> {
    const selectedNote = this.page.locator('.note-item.selected .note-title');
    return await selectedNote.textContent() || '';
  }

  async isNoteSelected(title: string): Promise<boolean> {
    const selectedNote = this.page.locator('.note-item.selected', { hasText: title });
    return await selectedNote.isVisible();
  }

  async getNoteTitles(): Promise<string[]> {
    const titles: string[] = [];
    const noteItems = await this.getNoteItems();
    
    for (const item of noteItems) {
      const titleElement = item.locator('.note-title');
      const title = await titleElement.textContent();
      titles.push(title || '');
    }
    
    return titles;
  }

  async getNotePreview(index: number): Promise<string> {
    const noteItem = this.noteItems.nth(index);
    const previewElement = noteItem.locator('.note-preview');
    return await previewElement.textContent() || '';
  }

  async isEmptyListVisible(): Promise<boolean> {
    return await this.emptyListState.isVisible();
  }
}
