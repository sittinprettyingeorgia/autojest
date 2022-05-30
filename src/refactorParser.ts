/* eslint-disable no-magic-numbers */
import React, { Component } from 'react';
import { ParserI, BracketString, ChildList } from './types';
const ZERO = 0;
const NEG_ONE = -1;
const DONT_KEEP: BracketString = {
  '(': '(',
  ')': ')',
  '"': '"',
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
          children[str] = {} as ChildList;
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
            str = '';
          }
        } else {
          //we need to differentiate between jsx elems and text children
          //if we hit a qoutation after our comma than our current str is a
          //text child, otherwise it is jsx elem.
          delete DONT_KEEP['"'];
          CLOSE_BRACKETS['"'] = '"';
        }
        return str;
      };

      handleClosingBracket = (
        str: string,
        parentOfStr: ChildList,
        textChild = false
      ) => {
        DONT_KEEP[','] = ',';
        DONT_KEEP['"'] = '"';
        str = str ? str.trim() : str;
        let strCount = 0;
        const keyCount = 0;
        const currentJsxElemIndex = this.jsxElemStack.length - 1;
        let parentElem: ChildList;
        let parentKey: string;
        if (!parentOfStr) return;

        if (this.jsxElemStack.length !== 0) {
          parentElem = this.jsxElemStack[currentJsxElemIndex];
          if (
            Object.keys(this.jsxElemStack[currentJsxElemIndex]).length !== 0
          ) {
            parentKey = Object.keys(this.jsxElemStack[currentJsxElemIndex])[0];
          } else {
            parentKey = 'children';
          }
        }
        console.log(
          'parentElemClosingBracketSTart',
          JSON.stringify(parentElem, undefined, 2)
        );

        const parentOfStrKey = Object.keys(parentOfStr)[0];
        console.log('parentOfStrKey', parentOfStrKey);
        /*if (
          !parentOfStr[parentOfStrKey] ||
          !('children' in parentOfStr[parentOfStrKey])
        ) {
          parentOfStr[parentOfStrKey] = {
            ...parentOfStr[parentOfStrKey],
            children: {} as ChildList,
          };
        }*/

        if (typeof parentOfStr !== 'string' && str && str in parentOfStr) {
          ++strCount;
          str = str.replaceAll(/\d+/g, '').concat(strCount.toString());
        }

        if (textChild) {
          const child = { children: { 'text-as-jsx-child': str } };
          parentOfStr = { ...parentOfStr, ...child };
          this.jsxElemStack.push(parentOfStr);
          return parentOfStr;
        } else if (!str) {
          if (parentElem) {
            parentElem[parentKey] = {
              ...parentElem[parentKey],
              ...parentOfStr,
            };
          }
          parentElem = parentOfStr;
        } else if (str.includes('children:')) {
          //first array elem will be the 'children:' text
          let [, val] = str.split(':');
          val = val.trim();
          const child = { children: { 'text-as-jsx-child': val } };
          parentOfStr[parentOfStrKey] = {
            ...parentOfStr[parentOfStrKey],
            ...child,
          };
          console.log(
            'parentElembefore addign children',
            JSON.stringify(parentElem, undefined, 2)
          );
          const mainParentChild = { children: { ...parentOfStr } };
          parentElem[parentKey] = {
            ...parentElem[parentKey],
            ...mainParentChild,
          };
        }

        console.log(
          'parentElemClosingBracket',
          JSON.stringify(parentElem, undefined, 2)
        );
        return parentElem;
      };

      getChildren = (jsx: string) => {
        let children: ChildList = {};
        let str = '';

        for (let i = ZERO; i < jsx.length; i++) {
          const char = jsx.charAt(i);
          if (char in DONT_KEEP) {
            continue;
          } else if (char === ',') {
            str = this.handleCommaInsideJsxElem(str);
          } else if (!(char in OPEN_BRACKETS) && !(char in CLOSE_BRACKETS)) {
            str += char;
          }

          if (char in OPEN_BRACKETS) {
            if (char === '{') {
              DONT_KEEP['"'] = '"';
              delete CLOSE_BRACKETS['"'];
            }

            const [newChild, leftOverStr] = this.handleOpeningBracket(str);
            this.jsxElemStack.push(newChild);
            str = '';
          } else if (char in CLOSE_BRACKETS) {
            //the stack will let us know if we are working with a jsx element or
            //if we have a text value

            let currentJsxElem = this.jsxElemStack.pop();
            const unevenJsx = jsx.substring(++i, jsx.length).indexOf('}') < 0;

            if (char === '"') {
              console.log('elemWithTextAsChildFlag', currentJsxElem);
              this.handleClosingBracket(str, currentJsxElem, true);
              str = '';
            } else if (this.jsxElemStack.length === 0 || unevenJsx) {
              if (unevenJsx) {
                this.handleClosingBracket(str, currentJsxElem);
                currentJsxElem = this.jsxElemStack.pop();
              }
              children = this.handleClosingBracket(str, currentJsxElem);
            } else {
              this.handleClosingBracket(str, currentJsxElem);
              str = '';
            }
          }
        }

        return children;
      };

      getJson = async (jsx: string) => {
        const mainChild = this.getChildren(jsx); //retrieve the main child and the rest of the jsx string
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
      const results: ChildList[] = [];
      results.push(new ParserHelper().getJson(compString[0]));
      return results;
      /*return Promise.all(
        /*compString.map(async (item) => {
          return new ParserHelper().getJson(item);
        })
      );*/
    };
  }
}
