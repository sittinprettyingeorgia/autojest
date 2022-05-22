import React from 'react';
export interface AutoJestI {
  parseComponent: (component: React.ReactComponent) => string;
}
export interface ParserI {
  parseComponent: () => string;
}
export interface FormatterI {
  formatComponent: () => string;
}
export interface FileWriterI {
  writeFile: () => void;
}
