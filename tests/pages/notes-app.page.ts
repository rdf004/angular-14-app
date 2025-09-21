import { Page, Locator } from '@playwright/test';
import { TestUtils } from '../fixtures/test-utils';

export class NotesAppPage {
  readonly page: Page;
  readonly utils: TestUtils;
  
  readonly appTitle: Locator;
  readonly newNoteButton: Locator;
  readonly settingsButton: Locator;
  
  readonly sidebar: Locator;
  readonly mainArea: Locator;
  readonly emptyState: Locator;
  readonly createFirstNoteButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.utils = new TestUtils(page);
    
    this.appTitle = page.locator('.app-title');
    this.newNoteButton = page.locator('.create-note-btn');
    this.settingsButton = page.locator('.settings-btn');
    
    this.sidebar = page.locator('.sidebar');
    this.mainArea = page.locator('.main-area');
    this.emptyState = page.locator('.empty-state');
    this.createFirstNoteButton = page.locator('.create-first-note-btn');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.utils.waitForAngularReady();
  }

  async createNewNote(): Promise<void> {
    await this.newNoteButton.click();
    await this.utils.waitForAutoSave();
  }

  async createFirstNote(): Promise<void> {
    await this.createFirstNoteButton.click();
    await this.utils.waitForAutoSave();
  }

  async isEmptyStateVisible(): Promise<boolean> {
    return await this.emptyState.isVisible();
  }

  async getAppTitle(): Promise<string> {
    return await this.appTitle.textContent() || '';
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.utils.waitForAngularReady();
  }
}
