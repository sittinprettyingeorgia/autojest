/* eslint-disable no-magic-numbers */
import { ParserI, BracketString, ChildList, ElemMap } from './types';
import { getUniqueElemName } from 'helpers';
export class RefactorParser implements ParserI {
  parseComponent: (component: () => JSX.Element) => Promise<ChildList[]>;
  cleanComponentString: (component: () => JSX.Element) => string[];

  constructor() {
    class ParserHelper {
      textIsJsxChild: boolean;
      jsxElemStack: ChildList[];
      eventLogicString = '';
      elemNameMap: ElemMap;

      constructor() {
        this.textIsJsxChild = false;
        this.jsxElemStack = [];
        this.elemNameMap = {};
      }

      ZERO = 0;
      NEG_ONE = -1;
      DONT_KEEP: BracketString = {
        '(': '(',
        ')': ')',
        '"': '"',
        "'": "'",
        ',': ',',
      };
      OPEN_BRACKETS: BracketString = {
        '{': '{',
        '[': '[', //means we are starting with children of current jsx elm
      };
      CLOSE_BRACKETS: BracketString = {
        '}': '}',
        ']': ']', //closing children of current jsx elem.
      };
      initialSplitRegex =
        /(return \(\(0, jsx_runtime_1\.jsxs\)\()|(return \(\(0, jsx_runtime_1\.jsx\)\()/gi;
      jsxRegex =
        /(\n)|(\(0, jsx_runtime_1\.jsxs\)\()|(\(0, jsx_runtime_1\.jsx\)\()/gi;
      initialSlice = 'return ((0, jsx_runtime_1.';
      replaceRegex = /(children:)|,/gi;

      getUniqueElemName = (elemName: string) => {
        elemName = elemName.trim();
        let count = 0;
        while (elemName in this.elemNameMap) {
          ++count;
          elemName = elemName.replaceAll(/\d+/g, '').concat(count.toString());
        }

        return elemName;
      };

      handleOpeningBracket = (
        str: string
      ): [children: ChildList, str: string] => {
        delete this.DONT_KEEP[','];

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
              : str.replaceAll(this.replaceRegex, '');
        }

        str = str.trim();
        str = this.getUniqueElemName(str);

        if (str) {
          children[str] = {} as ChildList;
        }

        return [children, str];
      };

      handleEvents = (str: string) => {
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
        return str;
      };

      handleCommaInsideJsxElem = (str: string) => {
        if (str.includes(':')) {
          str = this.handleEvents(str);
        } else {
          //we need to differentiate between jsx elems and text children
          //if we hit a qoutation after our comma than our current str is a
          //text child, otherwise it is jsx elem.
          delete this.DONT_KEEP['"'];
          this.CLOSE_BRACKETS['"'] = '"';
        }
        return str;
      };

      getParentElemAndKey = (): [parentElem: ChildList, parentKey: string] => {
        let parentElem: ChildList;
        let parentKey: string;
        const currentJsxElemIndex = this.jsxElemStack.length - 1;

        if (this.jsxElemStack.length !== 0) {
          parentElem = this.jsxElemStack[currentJsxElemIndex];
          if (
            Object.keys(this.jsxElemStack[currentJsxElemIndex]).length !== 0
          ) {
            parentKey = Object.keys(this.jsxElemStack[currentJsxElemIndex])[0];
          } else {
            parentKey = 'children' + Math.floor(Math.random() * 10);
          }
        }

        return [parentElem, parentKey];
      };

      handleTextChild = (str: string, parentOfStr: ChildList): ChildList => {
        if (!('children' in parentOfStr)) {
          const child = { children: { 'text-as-jsx-child': str } };
          parentOfStr = { ...parentOfStr, ...child };
        } else {
          parentOfStr['children'] = {
            ...parentOfStr['children'],
            'text-as-jsx-child': str,
          };
        }

        this.jsxElemStack.push(parentOfStr);
        return parentOfStr;
      };

      getParentOfStr = (
        str: string,
        parentOfStrKey: string,
        parentOfStr: ChildList
      ): ChildList => {
        //first array elem will be the 'children:' text
        let [, val] = str.split(':');
        val = val.trim();
        const child = { children: { 'text-as-jsx-child': val } };
        parentOfStr[parentOfStrKey] = {
          ...parentOfStr[parentOfStrKey],
          ...child,
        };
        return parentOfStr;
      };

      getMainParentChild = (
        parentOfStr: ChildList,
        parentKey: string
      ): ChildList => {
        let mainParentChild;
        if (parentKey === 'children') {
          mainParentChild = { ...parentOfStr };
        } else {
          mainParentChild = { children: { ...parentOfStr } };
        }
        return mainParentChild;
      };

      handleChildrenText = (
        parentElem: ChildList,
        parentKey: string,
        mainParentChild: ChildList
      ): ChildList => {
        parentElem[parentKey] = {
          ...parentElem[parentKey],
          ...mainParentChild,
        };

        return parentElem;
      };

      handleClosingBracket = (
        str: string,
        parentOfStr: ChildList,
        textChild = false
      ) => {
        if (!parentOfStr) return;

        this.DONT_KEEP[','] = ',';
        this.DONT_KEEP['"'] = '"';
        // eslint-disable-next-line prefer-const
        let [parentElem, parentKey] = this.getParentElemAndKey();
        const parentOfStrKey = Object.keys(parentOfStr)[0];
        str = this.getUniqueElemName(str);

        if (textChild) {
          return this.handleTextChild(str, parentOfStr);
        } else if (!str) {
          if (parentElem) {
            parentElem[parentKey] = {
              ...parentElem[parentKey],
              ...parentOfStr,
            };
          }
          parentElem = parentOfStr;
        } else if (str.includes('children:')) {
          parentOfStr = this.getParentOfStr(str, parentOfStrKey, parentOfStr);
          const mainParentChild = this.getMainParentChild(
            parentOfStr,
            parentKey
          );
          parentElem = this.handleChildrenText(
            parentElem,
            parentKey,
            mainParentChild
          );
        }
        return parentElem;
      };

      handleStackInClosingBracket = (
        char: string,
        str: string,
        jsx: string,
        i: number,
        children: ChildList
      ): [children: ChildList, str: string] => {
        let currentJsxElem = this.jsxElemStack.pop();
        const unevenJsx = jsx.substring(i + 1, jsx.length).indexOf('}') < 0;

        if (char === '"') {
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

        return [children, str];
      };

      handleChar = (
        char: string,
        str: string
      ): [str: string, next: boolean] => {
        let next = false;
        if (char in this.DONT_KEEP) {
          next = true;
        } else if (char === ',') {
          str = this.handleCommaInsideJsxElem(str);
        } else if (
          !(char in this.OPEN_BRACKETS) &&
          !(char in this.CLOSE_BRACKETS)
        ) {
          str += char;
        }

        return [str, next];
      };

      getChildren = (jsx: string) => {
        let children: ChildList = {};
        let str = '';

        for (let i = this.ZERO; i < jsx.length; i++) {
          const char = jsx.charAt(i);
          const [newCharStr, next] = this.handleChar(char, str);
          if (next) {
            continue;
          }
          str = newCharStr;

          if (char in this.OPEN_BRACKETS) {
            if (char === '{') {
              this.DONT_KEEP['"'] = '"';
              delete this.CLOSE_BRACKETS['"'];
            }

            const [newChild] = this.handleOpeningBracket(str);
            this.jsxElemStack.push(newChild);
            str = '';
          } else if (char in this.CLOSE_BRACKETS) {
            //the stack will let us know if we are working with a jsx element or
            //if we have a text value
            const [newChildren, newStr] = this.handleStackInClosingBracket(
              char,
              str,
              jsx,
              i,
              children
            );

            children = newChildren;
            str = newStr;
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
