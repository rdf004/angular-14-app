import { Page } from '@playwright/test';
import { STORAGE_KEY } from './test-data';

export class TestUtils {
  constructor(private page: Page) {}

  /**
   * Clear localStorage to ensure clean test state
   */
  async clearLocalStorage(): Promise<void> {
    await this.page.evaluate(() => {
      localStorage.clear();
    });
  }

  /**
   * Wait for Angular to be ready
   */
  async waitForAngularReady(): Promise<void> {
    await this.page.waitForFunction(() => {
      return window.hasOwnProperty('ng') && 
             document.readyState === 'complete';
    });
  }

  /**
   * Wait for auto-save to complete (500ms debounce)
   */
  async waitForAutoSave(): Promise<void> {
    await this.page.waitForTimeout(600); // 500ms debounce + 100ms buffer
  }

  /**
   * Get notes from localStorage
   */
  async getNotesFromStorage(): Promise<any[]> {
    return await this.page.evaluate((storageKey) => {
      const data = localStorage.getItem(storageKey);
      return data ? JSON.parse(data) : [];
    }, STORAGE_KEY);
  }

  /**
   * Set notes in localStorage
   */
  async setNotesInStorage(notes: any[]): Promise<void> {
    await this.page.evaluate(({ notes, storageKey }) => {
      localStorage.setItem(storageKey, JSON.stringify(notes));
    }, { notes, storageKey: STORAGE_KEY });
  }

  /**
   * Wait for element to be visible and stable
   */
  async waitForStableElement(selector: string): Promise<void> {
    await this.page.waitForSelector(selector, { state: 'visible' });
    await this.page.waitForTimeout(100); // Small buffer for stability
  }

  /**
   * Get note count from sidebar
   */
  async getNoteCount(): Promise<number> {
    const countText = await this.page.textContent('.note-count');
    const match = countText?.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Check if empty state is visible
   */
  async isEmptyStateVisible(): Promise<boolean> {
    return await this.page.isVisible('.empty-state');
  }

  /**
   * Check if note list empty state is visible
   */
  async isNoteListEmptyStateVisible(): Promise<boolean> {
    return await this.page.isVisible('.empty-list');
  }
}
