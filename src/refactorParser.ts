/* eslint-disable no-magic-numbers */
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
  '[': '[', //means we are starting with children of current jsx elm
};
const CLOSE_BRACKETS: BracketString = {
  '}': '}',
  ']': ']', //closing children of current jsx elem.
};

const initialSplitRegex =
  /(return \(\(0, jsx_runtime_1\.jsxs\)\()|(return \(\(0, jsx_runtime_1\.jsx\)\()/gi;
const jsxRegex =
  /(\n)|(\(0, jsx_runtime_1\.jsxs\)\()|(\(0, jsx_runtime_1\.jsx\)\()/gi;
const initialSlice = 'return ((0, jsx_runtime_1.';
const replaceRegex = /(children:)|,/gi;
export const cleanComponentString = (component: () => JSX.Element) => {
  const compString = component.toString();
  const mainChild = compString
    .split(initialSplitRegex)
    .filter((item: string) => {
      return Boolean(item) && !item.startsWith(initialSlice);
    });
  //TODO: we should save eventLogic in case we want to attempt templates for event handling
  const eventLogicString = mainChild.shift();
  const jsxList = mainChild.map((jsx) => jsx.replaceAll(jsxRegex, ''));
  return jsxList.map((jsx: string) => jsx.slice(ZERO, jsx.indexOf(';')));
};
export class RefactorParser implements ParserI {
  parseComponent: (component: () => JSX.Element) => Promise<ChildList[]>;
  cleanComponentString: (component: () => JSX.Element) => string[];
  constructor() {
    class ParserHelper {
      textIsJsxChild: boolean;
      jsxElemStack: ChildList[];
      eventLogicString = '';

      constructor() {
        this.textIsJsxChild = false;
        this.jsxElemStack = [];
      }
      handleOpeningBracket = (
        str: string
      ): [children: ChildList, str: string] => {
        delete DONT_KEEP[','];
        DONT_KEEP['"'] = '"';
        delete OPEN_BRACKETS['"'];
        const children: ChildList = {};
        str = str.trim();

        //we have encountered textAsJsxChild
        if (str.includes('"')) {
          children['text-as-jsx-child'] = str;
          //remove the comma from our opening brackets map and add to dont keep

          return [children, str];
        } else {
          str =
            str && !str.includes('children:')
              ? str.trim()
              : str.replaceAll(replaceRegex, '');
        }

        str = str.trim();
        if (str) {
          children[str ? str : 'children'] = {} as ChildList;
        }

        return [children, str];
      };

      handleCommaInsideJsxElem = (str: string) => {
        if (str.includes(':')) {
          if (str.includes('children')) {
            str = str.replaceAll('children:', '').trim();
          } else {
            const [key, val] = str.split(':');
            const elemToAppend = Object.values(
              this.jsxElemStack[this.jsxElemStack.length - 1]
            )[0];
            elemToAppend[key.trim()] = val.trim();
          }
        } else {
          //we need to differentiate between jsx elems and text children
          //if we hit a qoutation after our comma than our current str is a
          //text child, otherwise it is jsx elem.
          delete DONT_KEEP['"'];
          OPEN_BRACKETS['"'] = '"';
        }
      };

      handleClosingBracket = (str: string, children: ChildList) => {
        DONT_KEEP[','] = ',';
        str = str.trim();
        let count = 1;
        const currentJsxElemIndex = this.jsxElemStack.length - 1;
        const parentElem =
          this.jsxElemStack.length !== 0
            ? this.jsxElemStack[currentJsxElemIndex]
            : children;
        if (!('children' in parentElem)) {
          this.jsxElemStack[currentJsxElemIndex]['children'] = {} as ChildList;
        }

        let currentJsxElemChildren = parentElem['children'];
        if (str in currentJsxElemChildren) {
          ++count;
          str = str.replaceAll(/\d+/g, '').concat(count.toString());
        }

        if (!str) {
          currentJsxElemChildren = { ...currentJsxElemChildren, ...children };
        } else if (str.includes('children:')) {
          //first array elem will be the 'children:' text
          let [, val] = str.split(':');
          val = val.trim();

          if ('children' in children) {
            children['children']['text-as-jsx-child'] = val;
          } else {
            const childrenKey: ChildList = {};
            childrenKey['text-as-jsx-child'] = val;
            children['children'] = childrenKey;
          }
        }
      };

      getChildren = (jsx: string) => {
        const children: ChildList[] = [];
        let str = '';

        for (let i = ZERO; i < jsx.length; i++) {
          const char = jsx.charAt(i);
          if (char in DONT_KEEP) {
            continue;
          } else if (char === ',') {
            this.handleCommaInsideJsxElem(str);
          } else if (!(char in OPEN_BRACKETS) && !(char in CLOSE_BRACKETS)) {
            str += char;
          }

          if (char in OPEN_BRACKETS) {
            const [newChild, leftOverStr] = this.handleOpeningBracket(str);
            this.jsxElemStack.push(newChild);
            str = '';
          } else if (char in CLOSE_BRACKETS) {
            //the stack will let us know if we are working with a jsx element or
            //if we have a text value
            const currentJsxElem = this.jsxElemStack.pop();
            this.handleClosingBracket(str, currentJsxElem);
            str = '';
          }
        }

        return children;
      };

      getJson = async (jsx: string) => {
        const [mainChild, _] = await this.getChildren(jsx); //retrieve the main child and the rest of the jsx string
        return mainChild;
      };
    }

    this.cleanComponentString = (component: () => JSX.Element) => {
      const compString = component.toString();
      const mainChild = compString
        .split(initialSplitRegex)
        .filter((item: string) => {
          return Boolean(item) && !item.startsWith(initialSlice);
        });
      //TODO: we should save eventLogic in case we want to attempt templates for event handling
      const eventLogicString = mainChild.shift();
      const jsxList = mainChild.map((jsx) => jsx.replaceAll(jsxRegex, ''));
      return jsxList.map((jsx: string) => jsx.slice(ZERO, jsx.indexOf(';')));
    };

    this.parseComponent = async (
      component: () => JSX.Element
    ): Promise<ChildList[]> => {
      const compString = this.cleanComponentString(component);
      return Promise.all(
        compString.map(async (item) => {
          return new ParserHelper().getJson(item);
        })
      );
    };
  }
}
