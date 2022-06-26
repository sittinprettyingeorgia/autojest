export type AttributeType = {
  elemName?: string; // div, p, span etc.
  onClick?: boolean;
  onChange?: boolean;
  onMouseOver?: boolean;
  onMouseDown?: boolean;
  onMouseOut?: boolean;
  onKeyDown?: boolean;
  onKeyPress?: boolean;
  onBlur?: boolean;
  onInput?: boolean;
  type?: string;
  'data-testid'?: string;
  PlaceholderText?: string;
  AltText?: string;
  Text?: string;
  children?: string; //text child only
  role?: string;
};
export type Attribute = {
  [key in keyof AttributeType]: string | boolean;
};

export type TextMap = {
  [key: string]: number;
};
export type TextChildren = {
  multiple: boolean;
  value: string;
};
export interface Flag {
  [key: string]: string;
}

export interface TextValue {
  [key: string]: boolean;
}

export type TestObjectType = {
  name: string;
  Text?: TextValue; // textValue : hasMultiple
  PlaceholderText?: TextValue;
  AltText?: TextValue;
  multiple?: TextValue;
  elems?: Attribute[];
};
export type TestObject = {
  [key in keyof TestObjectType]: string | TextValue | Attribute[];
};

export interface ChildList {
  [key: string]: any;
}
export interface AutoJestI {
  parseComponent: (component: () => JSX.Element) => ChildList;
}
export interface ParserI {
  parseComponent: (component: () => JSX.Element) => Promise<string[]>;
}
export interface FormatterI {
  formatTestObject: (testObj: TestObject) => string;
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
