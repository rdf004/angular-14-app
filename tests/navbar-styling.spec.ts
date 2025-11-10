import { test, expect } from '@playwright/test';
import { NotesAppPage } from './pages/notes-app.page';

test.describe('Navbar Styling', () => {
  let notesApp: NotesAppPage;

  test.beforeEach(async ({ page }) => {
    notesApp = new NotesAppPage(page);
    await notesApp.goto();
  });

  test('should render box-shadow on navbar header', async ({ page }) => {
    await expect(notesApp.header).toBeVisible();
    
    const boxShadow = await notesApp.header.evaluate((el) => {
      return window.getComputedStyle(el).boxShadow;
    });
    
    expect(boxShadow).not.toBe('none');
    expect(boxShadow).toContain('rgba');
    expect(boxShadow).toContain('2px');
    expect(boxShadow).toContain('4px');
    
    await notesApp.header.screenshot({ 
      path: '/home/ubuntu/screenshots/navbar-shadow-test.png' 
    });
  });

  test('should maintain box-shadow with content below navbar', async ({ page }) => {
    await notesApp.createNewNote();
    
    await expect(notesApp.header).toBeVisible();
    
    const boxShadow = await notesApp.header.evaluate((el) => {
      return window.getComputedStyle(el).boxShadow;
    });
    
    expect(boxShadow).not.toBe('none');
    expect(boxShadow).toContain('rgba');
    
    await page.screenshot({ 
      path: '/home/ubuntu/screenshots/navbar-shadow-with-content-test.png',
      fullPage: true
    });
  });
});
