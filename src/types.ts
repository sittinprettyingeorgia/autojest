import React from 'react';
export interface AutoJestI {
  parseComponent: (component: React.Component) => string;
}
export interface ParserI {
  parseComponent: (component: React.Component) => string;
}
export interface FormatterI {
  formatComponent: () => string;
}
export interface FileWriterI {
  writeFile: () => void;
}
