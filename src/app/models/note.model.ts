export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotePreview {
  id: string;
  title: string;
  preview: string;
  createdAt: Date;
  updatedAt: Date;
}
