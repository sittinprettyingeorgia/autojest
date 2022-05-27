import React from 'react';
import { AutoJestI, ParserI, FormatterI, FileWriterI } from './types';

interface BracketString {
  [key: string]: string;
}
interface ChildList {
  [key: string]: any;
}
class Parser implements ParserI {
  getTextValueIsChild: () => boolean;
  setTextValueIsChild: (val: boolean) => void;
  pushStack: () => void;
  popStack: () => void;
  isStackEmpty: () => boolean;
  parseComponent: (component: React.Component) => string;

  constructor() {
    const ZERO = 0;
    const NEG_ONE = -1;
    const DONT_KEEP: BracketString = {
      '(': '(',
      ')': ')',
      '"': '"',
      '[': '[',
      ']': ']',
      ' ': ' ',
      "'": "'",
      ',': ',',
    };
    const OPEN_BRACKETS: BracketString = {
      '{': '{',
    };
    const CLOSE_BRACKETS: BracketString = {
      '}': '}',
    };
    const initialSplitRegex =
      /(return \(\(0, jsx_runtime_1\.jsxs\)\()|(return \(\(0, jsx_runtime_1\.jsx\)\()/gi;
    const jsxRegex =
      /(\n)|(\(0, jsx_runtime_1\.jsxs\)\()|(\(0, jsx_runtime_1\.jsx\)\()/gi;
    const initialSlice = 'return ((0, jsx_runtime_1.';
    const assignRegex = /, __assign/gi;
    const replaceRegex = /(children:)|,/gi;
    const stack: string[] = [];
    let textValueIsJsxChild = false;

    this.getTextValueIsChild = () => {
      return textValueIsJsxChild;
    };

    this.setTextValueIsChild = (val: boolean) => {
      textValueIsJsxChild = val;
    };

    this.pushStack = () => {
      stack.push('{');
    };

    this.popStack = () => {
      stack.pop();
    };

    this.isStackEmpty = () => {
      return stack.length === ZERO;
    };
  }
}
