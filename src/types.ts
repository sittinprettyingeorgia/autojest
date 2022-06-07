import React from 'react';
export interface BracketString {
  [key: string]: string;
}
export interface ChildList {
  [key: string]: any;
}
export interface AutoJestI {
  parseComponent: (component: () => JSX.Element) => ChildList;
}
export interface ParserI {
  parseComponent: (component: () => JSX.Element) => ChildList;
}
export interface FormatterI {
  formatComponent: () => string;
}
export interface FileWriterI {
  writeFile: () => void;
}
export interface ElemMap {
  [key: string]: number;
}
export type Event = {
  elemName: string; // div, p, span etc.
  onClick?: boolean;
  onChange?: boolean;
  onMouseOver?: boolean;
  onMouseDown?: boolean;
  onMouseOut?: boolean;
  onKeyDown?: boolean;
  onKeyPress?: boolean;
  onBlur?: boolean;
  onInput?: boolean;
};
export interface TestObject {
  jsx?: string[];
  placeholder?: string[];
  label?: string[];
  alt?: string[];
  title?: string[];
  events?: Event[];
}
