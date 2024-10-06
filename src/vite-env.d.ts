/// <reference types="vite/client" />

import { BaseEditor } from 'slate';
import { ReactEditor } from 'slate-react';
import { HistoryEditor } from 'slate-history';

type CustomText = {
  text: string;
  bold?: true;
  underline?: true;
  strikethrough?: true;
  header?: 'h1' | 'h2' | 'h3';
  link?: true;
  italic?: true;
};

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Text: CustomText;
  }
}
