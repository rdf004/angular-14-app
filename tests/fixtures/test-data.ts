export interface TestNote {
  title: string;
  content: string;
}

export const testNotes: TestNote[] = [
  {
    title: 'First Test Note',
    content: 'This is the content of the first test note. It contains some sample text to test the editor functionality.'
  },
  {
    title: 'Second Test Note',
    content: 'This is another test note with different content. It helps test note selection and switching between notes.'
  },
  {
    title: 'Note with Special Characters',
    content: 'This note contains special characters: !@#$%^&*()_+-=[]{}|;:,.<>? and unicode: 🚀 ✨ 📝'
  },
  {
    title: 'Long Content Note',
    content: 'This is a note with much longer content to test how the application handles larger amounts of text. '.repeat(10) + 'End of long content.'
  },
  {
    title: '',
    content: 'This note has an empty title to test the "Untitled" fallback behavior.'
  }
];

export const STORAGE_KEY = 'notes-app-data';
