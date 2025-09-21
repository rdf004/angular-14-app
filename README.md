# Angular 14 Notes App

A minimalist notes application built with Angular 14, featuring a canvas-style editor similar to Notion.

> **Note**: This is a demo application showcasing Angular 14 capabilities with a clean, modern interface.

## Features

- **Two-pane layout**: Left sidebar for note list, main area for editing
- **Canvas-style editing**: Clean, distraction-free writing experience
- **Rich text formatting**: Support for bold, italic, and underline (Ctrl+B, Ctrl+I, Ctrl+U)
- **Auto-save**: Changes are automatically saved as you type
- **Local storage**: Notes persist between sessions
- **Minimalist design**: Clean, modern interface focused on writing
- **Responsive**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (Node Package Manager)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open your browser and navigate to `http://localhost:4200`

## Usage

- **Create a new note**: Click the "New Note" button in the top right
- **Select a note**: Click on any note in the left sidebar
- **Edit a note**: Click on the title or content area to start editing
- **Delete a note**: Hover over a note in the sidebar and click the delete button
- **Format text**: Use keyboard shortcuts (Ctrl+B for bold, Ctrl+I for italic, Ctrl+U for underline)

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── note-list/          # Left sidebar component
│   │   └── note-editor/        # Main editor component
│   ├── models/
│   │   └── note.model.ts       # Note data model
│   ├── services/
│   │   └── notes.service.ts    # Note management service
│   ├── app.component.*         # Main app component
│   └── app.module.ts          # App module
├── environments/              # Environment configurations
└── styles.css                # Global styles
```

## Technologies Used

- Angular 14
- TypeScript
- RxJS
- Local Storage API
- CSS3 with Flexbox
- Inter font family

## Development

### Build

Run `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory.

### Code Style

This project follows Angular style guide and uses TypeScript strict mode for better code quality.

## License

This project is open source and available under the MIT License.
