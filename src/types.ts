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
