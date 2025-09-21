import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { NoteListComponent } from './components/note-list/note-list.component';
import { NoteEditorComponent } from './components/note-editor/note-editor.component';
import { ReflectionPaneComponent } from './components/reflection-pane/reflection-pane.component';
import { ApiKeyModalComponent } from './components/api-key-modal/api-key-modal.component';
import { QuoteModalComponent } from './components/quote-modal/quote-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    NoteListComponent,
    NoteEditorComponent,
    ReflectionPaneComponent,
    ApiKeyModalComponent,
    QuoteModalComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
