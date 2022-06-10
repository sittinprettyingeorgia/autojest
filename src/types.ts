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

/**
 * ChildrenType is the object referenced by the children key
 * within an object returned by the cleanComponent method.
 */
export type ChildrenType = {
  children: (string | object)[];
};

export type AttributeType = {
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
  'data-testid'?: string;
  role?: string;
};
export type Attribute = {
  [key in keyof AttributeType]: string | boolean;
};

export type TestObjectType = {
  jsxText?: string[];
  placeholderText?: string[];
  labelText?: string[];
  altText?: string[];
  titleText?: string[];
  events?: Attribute[];
};
export type TestObject = {
  [key in keyof TestObjectType]: string[] | Event[];
};
