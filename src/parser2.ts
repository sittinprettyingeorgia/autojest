import React, { Component } from 'react';
import { ParserI, BracketString, ChildList } from './types';
const ZERO = 0;
const NEG_ONE = -1;
const DONT_KEEP: BracketString = {
  '(': '(',
  ')': ')',
  '"': '"',
  '[': '[',
  ']': ']',
  "'": "'",
  ',': ',',
};

const OPEN_BRACKETS: BracketString = {
  '{': '{',
  '[': '[',
};
const CLOSE_BRACKETS: BracketString = {
  '}': '}',
  ']': ']',
};

const initialSplitRegex =
  /(return \(\(0, jsx_runtime_1\.jsxs\)\()|(return \(\(0, jsx_runtime_1\.jsx\)\()/gi;
const jsxRegex =
  /(\n)|(\(0, jsx_runtime_1\.jsxs\)\()|(\(0, jsx_runtime_1\.jsx\)\()/gi;
const initialSlice = 'return ((0, jsx_runtime_1.';
const replaceRegex = /(children:)|,/gi;
const stack: string[] = [];
let textValueIsJsxChild = false;

// We are now going to refactor this class to use memoization because of performance issues with our recursive algorithm.
export const handleOpeningBracket = async (
  start: number,
  str: string,
  jsx: string,
  children: ChildList,
  recursiveFunction: (
    startIndex: number,
    recStr: string,
    recJsx: string,
    recChildren: ChildList
  ) => Promise<any>
) => {
  //delete our comma key from dont keep since we are currently inside of brackets
  //we want to keep commas in our str string
  delete DONT_KEEP[','];
  let count = 1;
  let propagate = false;
  str = str.trim();

  if (str.includes('children:') && str.includes(',')) {
    const [singleTextChild, nextElem] = str
      .split(',')
      .map((item) => item.trim())
      .filter((item) => Boolean(item));

    if (nextElem) {
      textValueIsJsxChild = true;
      const [childrenKey, textValue] = singleTextChild
        .split(':')
        .map((item) => item.trim())
        .filter((item) => Boolean(item));

      children[childrenKey] = {
        ...children,
        'text-as-jsx-child': textValue,
      };
      children = children[childrenKey];
      str = nextElem;
    }
  }
  // remove the children: prefix if we are working with jsx elements
  // otherwise assign children because it is likely a text value.
  str = str ? str.replaceAll(replaceRegex, '') + count : 'children';
  str = str.trim();
  const [newChild, lastIndexOfJsx] = await recursiveFunction(
    ++start,
    '',
    jsx,
    textValueIsJsxChild ? children : {}
  );

  //while our current key is present we will increment the count and see if the new key is found.
  //EX. div1 in children then create div2 and check if in children
  if (str in children) {
    ++count;
    str = str.replaceAll(/\d+/g, '').concat(count.toString());
  }

  if (str.includes('children')) {
    propagate = true;
    children[str] =
      typeof newChild === 'string' && newChild.includes('children:')
        ? { 'text-as-jsx-child': newChild.replace('children:', '') }
        : newChild;
  } else {
    if (typeof newChild === 'string' && newChild.includes('children:')) {
      children[str] = {
        children: {
          'text-as-jsx-child': newChild.replace('children:', ''),
        },
      };
    } else {
      children[str] =
        'children' in newChild ? newChild : { children: newChild };
    }
  }

  return [{ ...children }, lastIndexOfJsx, propagate];
};

export const handleClosingBracket = async (
  start: number,
  str: string,
  jsx: string,
  children: ChildList,
  recursiveFunction: (
    startIndex: number,
    recStr: string,
    recJsx: string,
    recChildren: ChildList
  ) => Promise<any>
) => {
  //add our comma back since we are currently outside of brackets
  //we do not want a comma in our str.
  DONT_KEEP[','] = ',';

  let propagate = true;
  str = str.trim();

  if (!str) {
    return [{ ...children }, ++start, propagate];
  } else if (str.includes('children:')) {
    return [str, ++start, propagate];
  } else if (str.includes(':')) {
    const tempSplit = str.split(',');

    for (const child of tempSplit) {
      const [key, val] = child.split(':');
      children[key.trim()] = val.trim();
    }
    propagate = false;
  }

  const [newChild, lastIndexOfJsx] = await recursiveFunction(
    ++start,
    '',
    jsx,
    children
  );

  return [newChild, lastIndexOfJsx, propagate];
};

export const getChildren = async (
  start: number,
  str: string,
  jsx: string,
  children: ChildList
): Promise<any> => {
  for (let i = start; i < jsx.length; i++) {
    const char = jsx.charAt(i);
    if (char in DONT_KEEP) {
      continue;
    } else if (!(char in OPEN_BRACKETS) && !(char in CLOSE_BRACKETS)) {
      str += char;
    }

    if (char in OPEN_BRACKETS) {
      stack.push('{');
      const [newChildren, lastIndexOfJsx, propagate] =
        await handleOpeningBracket(++i, str, jsx, children, getChildren);

      if (propagate) {
        return [newChildren, lastIndexOfJsx, false];
      }

      str = '';
      i = lastIndexOfJsx;
      if (lastIndexOfJsx === NEG_ONE) break;
    } else if (char in CLOSE_BRACKETS) {
      //the stack will let us know if we are working with a jsx element or
      //if we have a text value
      stack.pop();
      if (textValueIsJsxChild) {
        DONT_KEEP[','] = ',';
        textValueIsJsxChild = false;
        continue;
      } else {
        return handleClosingBracket(++i, str, jsx, children, getChildren);
      }
    }
  }

  return [children, NEG_ONE, true];
};

export const cleanComponentString = (component: () => JSX.Element) => {
  const compString = component.toString();
  const mainChild = compString
    .split(initialSplitRegex)
    .filter((item: string) => {
      return Boolean(item) && !item.startsWith(initialSlice);
    });
  const jsxList = mainChild.map((jsx) => jsx.replaceAll(jsxRegex, ''));
  return jsxList.map((jsx: string) => jsx.slice(ZERO, jsx.indexOf(';')));
};

export class Parser2 implements ParserI {
  parseComponent: (component: () => JSX.Element) => Promise<ChildList[]>;

  constructor() {
    class ParserHelper {
      textIsJsxChild: boolean;
      jsxElemStack: ChildList[];
      eventLogicString = '';

      constructor() {
        this.textIsJsxChild = false;
        this.jsxElemStack = [];
      }

      cleanComponentString = (component: () => JSX.Element) => {
        const compString = component.toString();
        const mainChild = compString
          .split(initialSplitRegex)
          .filter((item: string) => {
            return Boolean(item) && !item.startsWith(initialSlice);
          });
        //TODO: we should save eventLogic in case we want to attempt templates for event handling
        this.eventLogicString = mainChild.shift();
        const jsxList = mainChild.map((jsx) => jsx.replaceAll(jsxRegex, ''));
        return jsxList.map((jsx: string) => jsx.slice(ZERO, jsx.indexOf(';')));
      };

      getJson = async (jsx: string) => {
        const [mainChild, _] = await getChildren(ZERO, '', jsx, {}); //retrieve the main child and the rest of the jsx string
        return mainChild;
      };
    }
    this.parseComponent = async (
      component: () => JSX.Element
    ): Promise<ChildList[]> => {
      const compString = cleanComponentString(component);
      return Promise.all(
        compString.map(async (item) => {
          return new ParserHelper().getJson(item);
        })
      );
    };
  }
}
