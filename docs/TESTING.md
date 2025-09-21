# Testing Guide

This document provides information about testing the Angular 14 Notes Application.

## Test Types

### Unit Tests (Jasmine/Karma)
The application includes unit tests using Angular's default testing framework.

```bash
# Run unit tests
npm test

# Run unit tests in watch mode
npm run test -- --watch
```

### End-to-End Tests (Playwright)
Comprehensive E2E tests using Playwright to test user workflows and interactions.

```bash
# Run all E2E tests (headless)
npm run test:e2e

# Run E2E tests with browser UI visible
npm run test:e2e:headed

# Run E2E tests with Playwright UI for debugging
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug
```

## E2E Test Coverage

The Playwright test suite covers the following areas:

### Note Creation Tests (`tests/note-creation.spec.ts`)
- Empty state display when no notes exist
- Creating notes via header "New Note" button
- Creating first note via empty state button
- Creating multiple notes
- Auto-selection of newly created notes
- Persistence of created notes in localStorage
- Handling rapid note creation

### Note Editing Tests (`tests/note-editing.spec.ts`)
- Title editing with auto-save functionality
- Content editing with auto-save
- Enter key navigation from title to content
- Tab key functionality in content editor
- Preview text updates in sidebar during editing
- Empty title fallback to "Untitled"
- Special characters handling
- Long content editing
- Edit persistence after page reload
- Rapid typing with auto-save debouncing
- Placeholder text display
- Format hint visibility

### Note Selection Tests (`tests/note-selection.spec.ts`)
- Selecting notes by clicking in sidebar
- Visual highlighting of selected notes
- Editor updates when switching between notes
- Selection persistence after page reload
- Handling selection with unsaved changes
- Selection by index
- Rapid note switching
- Note order maintenance in sidebar
- Correct note count display
- Empty selection handling

### Note Deletion Tests (`tests/note-deletion.spec.ts`)
- Delete button visibility on hover
- Delete confirmation dialog
- Deletion cancellation
- Auto-selection of next note after deletion
- Handling deletion of last remaining note
- localStorage cleanup after deletion
- Deletion by index
- Deletion persistence after page reload
- Rapid deletions
- Event bubbling prevention for delete button

### Local Storage Tests (`tests/local-storage.spec.ts`)
- Loading notes from localStorage on app start
- Saving new notes to localStorage
- Updating existing notes in localStorage
- Removing deleted notes from localStorage
- Note persistence across page reloads
- Handling corrupted localStorage gracefully
- Handling missing localStorage data
- Note order preservation
- Large data handling
- Data integrity during rapid operations

## Test Architecture

### Page Object Model
Tests use the Page Object Model pattern for maintainability:

- `tests/pages/notes-app.page.ts` - Main application interactions
- `tests/pages/note-list.page.ts` - Sidebar note list operations
- `tests/pages/note-editor.page.ts` - Editor-specific interactions

### Test Utilities
- `tests/fixtures/test-utils.ts` - Common utilities for localStorage management and Angular integration
- `tests/fixtures/test-data.ts` - Test data and constants

### Configuration
- `playwright.config.ts` - Playwright configuration with Angular dev server integration
- Tests run on Chromium, Firefox, and Safari browsers
- Automatic dev server startup before tests
- HTML reports generated for test results

## Running Tests Locally

1. **Prerequisites**: Ensure Node.js and npm are installed
2. **Install dependencies**: `npm install`
3. **Run E2E tests**: `npm run test:e2e`

The tests will automatically:
- Start the Angular development server
- Run tests across all configured browsers
- Generate an HTML report
- Clean up after completion

## Debugging Tests

### Using Playwright UI
```bash
npm run test:e2e:ui
```
This opens the Playwright UI where you can:
- Run individual tests
- Step through test execution
- Inspect element selectors
- View screenshots and videos

### Using Debug Mode
```bash
npm run test:e2e:debug
```
This runs tests in debug mode with:
- Browser visible
- Slower execution
- Debugger breakpoints supported

### Viewing Test Reports
After running tests, an HTML report is generated in `playwright-report/`. Open `playwright-report/index.html` in a browser to view detailed results including:
- Test execution timeline
- Screenshots on failure
- Error details and stack traces
- Performance metrics

## Test Data Management

Tests use isolated localStorage for each test to ensure:
- No interference between tests
- Predictable test state
- Easy cleanup

Each test starts with a clean slate and can set up its own test data as needed.

## Browser Support

Tests run on:
- **Chromium** (Chrome/Edge equivalent)
- **Firefox**
- **Safari** (WebKit)

This ensures cross-browser compatibility of the application.
