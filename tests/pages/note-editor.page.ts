import { Page, Locator } from '@playwright/test';
import { TestUtils } from '../fixtures/test-utils';

export class NoteEditorPage {
  readonly page: Page;
  readonly utils: TestUtils;
  
  readonly editorContainer: Locator;
  readonly titleInput: Locator;
  readonly contentEditor: Locator;
  readonly noteDate: Locator;
  readonly formatHint: Locator;

  constructor(page: Page) {
    this.page = page;
    this.utils = new TestUtils(page);
    
    this.editorContainer = page.locator('.editor-container');
    this.titleInput = page.locator('.title-input');
    this.contentEditor = page.locator('.content-editor');
    this.noteDate = page.locator('.note-date');
    this.formatHint = page.locator('.format-hint');
  }

  async isEditorVisible(): Promise<boolean> {
    return await this.editorContainer.isVisible();
  }

  async setTitle(title: string): Promise<void> {
    await this.titleInput.clear();
    await this.titleInput.fill(title);
    await this.utils.waitForAutoSave();
  }

  async getTitle(): Promise<string> {
    return await this.titleInput.inputValue();
  }

  async setContent(content: string): Promise<void> {
    await this.contentEditor.clear();
    await this.contentEditor.fill(content);
    await this.utils.waitForAutoSave();
  }

  async getContent(): Promise<string> {
    return await this.contentEditor.inputValue();
  }

  async appendContent(content: string): Promise<void> {
    await this.contentEditor.focus();
    await this.page.keyboard.press('End'); // Move to end
    await this.contentEditor.type(content);
    await this.utils.waitForAutoSave();
  }

  async clearTitle(): Promise<void> {
    await this.titleInput.clear();
    await this.utils.waitForAutoSave();
  }

  async clearContent(): Promise<void> {
    await this.contentEditor.clear();
    await this.utils.waitForAutoSave();
  }

  async focusTitle(): Promise<void> {
    await this.titleInput.focus();
  }

  async focusContent(): Promise<void> {
    await this.contentEditor.focus();
  }

  async pressEnterInTitle(): Promise<void> {
    await this.titleInput.focus();
    await this.page.keyboard.press('Enter');
  }

  async pressTabInContent(): Promise<void> {
    await this.contentEditor.focus();
    await this.page.keyboard.press('Tab');
  }

  async getDisplayedDate(): Promise<string> {
    return await this.noteDate.textContent() || '';
  }

  async isFormatHintVisible(): Promise<boolean> {
    return await this.formatHint.isVisible();
  }

  async getTitlePlaceholder(): Promise<string> {
    return await this.titleInput.getAttribute('placeholder') || '';
  }

  async getContentPlaceholder(): Promise<string> {
    return await this.contentEditor.getAttribute('placeholder') || '';
  }

  async waitForEditorReady(): Promise<void> {
    await this.editorContainer.waitFor({ state: 'visible' });
    await this.titleInput.waitFor({ state: 'visible' });
    await this.contentEditor.waitFor({ state: 'visible' });
  }
}
