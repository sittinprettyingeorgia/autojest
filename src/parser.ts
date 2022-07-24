import {
  DONT_KEEP_REGEX,
  CHILDREN_KEY,
  MULTIPLE_CHILD,
  SINGLE_CHILD,
  MULTI,
  SINGLE,
  DONT_KEEP_MAP,
  MATCH_TEXT_CHILD,
  INIT_SPLIT,
  INIT_SLICE,
} from 'constant';
import TextHandler from 'TextHandler';
import Formatter from './formatter';
import { Elem, ParserI, TestObject, TextValue } from './types';
class Parser implements ParserI {
  parseComponent: (component: () => JSX.Element) => Promise<string[]>;

  constructor() {
    class ParserHelper {
      testObject: TestObject;
      elemStack: Elem[];
      pastFirst: boolean;
      commaFlag: boolean;
      possibleTextChild: boolean;

      constructor(testObject: TestObject) {
        this.testObject = testObject;
        this.elemStack = [];
        this.pastFirst = false;
        this.commaFlag = false;
        this.possibleTextChild = false;
      }

      handleFirstOpeningBracket = (
        str: string,
        currentAttr: Elem
      ): [str: string, newAttr: Elem] => {
        //we need to assign current str as the name of our first Elem
        currentAttr.elemName = str.trim().replaceAll(DONT_KEEP_REGEX, '');
        str = '';
        this.pastFirst = true; //are we past the mainChild?
        this.commaFlag = true; //are we within an elements Elems or not.

        return [str, currentAttr];
      };

      handleOpeningBracket = (
        str: string,
        currentAttr: Elem
      ): [str: string, newAttr: Elem] => {
        //we need to remove all unused chars
        /* TODO: this should be simplified to a single regex*/
        str = str.replace(CHILDREN_KEY, '');
        str = str.replaceAll(MULTIPLE_CHILD, '');
        str = str.replaceAll(SINGLE_CHILD, '');
        str = str.replaceAll(MULTI, '');
        str = str.replaceAll(SINGLE, '');

        str = str.replaceAll(DONT_KEEP_REGEX, '');

        //we need to push our parent attr on the stack and assign a new currentAttr
        if (currentAttr) this.elemStack.push(currentAttr);
        const newAttr: Elem = {};
        newAttr.elemName = str.trim().replaceAll(DONT_KEEP_REGEX, '');
        this.commaFlag = true;

        return ['', newAttr];
      };

      handleKeyVal = (str: string): [key: string, val: string] => {
        let [key, val] = str.split(':');
        key = key.trim().replaceAll(DONT_KEEP_REGEX, '');
        val = val ? val.trim().replaceAll(DONT_KEEP_REGEX, '') : val;

        const end = 'Text';
        if (key === 'placeholder' || key === 'alt') {
          return [
            (key.charAt(0) as string).toUpperCase() + key.substring(1) + end,
            val,
          ];
        } else if (key === 'children') {
          return [end, val];
        }

        return [key, val];
      };

      handleElem = (
        str: string,
        currentAttr: Elem
      ): [str: string, newAttr: Elem] => {
        //we need to handle Elem assignment(onclick,data-testid, etc)
        str = str.replaceAll('"', '');
        let [key, val] = str.split(':');
        key = key.trim().replaceAll(DONT_KEEP_REGEX, '');
        val = val ? val.trim().replaceAll(DONT_KEEP_REGEX, '') : val;

        if (key && val) currentAttr[key.trim() as keyof Elem] = val.trim();

        return ['', currentAttr];
      };

      handleElems = (currentAttr: Elem, str: string): void => {
        const parentElem = this.getParent();
        const [key, val] = this.handleKeyVal(str);

        if (key && val) currentAttr[key as keyof Elem] = val;

        if (
          currentAttr != null &&
          !(this.testObject.elems as Elem[]).includes(currentAttr)
        )
          (this.testObject.elems as Elem[]).push(currentAttr);

        this.commaFlag = false;

        if (
          this.elemStack.length < 1 &&
          parentElem !== null &&
          !(this.testObject.elems as Elem[]).includes(parentElem)
        ) {
          (this.testObject.elems as Elem[]).push(parentElem);
        }
      };

      getParent = (): Elem => {
        let parentElem: Elem;
        if (this.elemStack.length > 0) {
          parentElem = this.elemStack.pop();
          if (parentElem === null || parentElem === undefined) {
            parentElem = {} as Elem;
          }
        }

        return parentElem;
      };

      handleClosingBracket = (
        str: string,
        currentAttr: Elem
      ): [str: string, newAttr: Elem] => {
        //we need to close up currentAttr and retrieve last elem from stack in case Elems are placed at end of elem
        const parentElem = this.getParent();
        this.handleElems(currentAttr, str);

        return ['', parentElem];
      };

      handlePossibleTextChildAtStart = (
        str: string,
        currentAttr: Elem
      ): [str: string, newAttr: Elem] => {
        const parentElem = this.getParent();

        if (!str.includes(SINGLE || MULTI)) {
          //console.log('handle text child start');
          this.handleElems(currentAttr, str);
        }

        this.possibleTextChild = false;
        return ['', parentElem];
      };

      handleChar = (
        char: string,
        str: string,
        currentAttr: Elem,
        currentIndex?: number,
        jsx?: string
      ): [str: string, newAttr: Elem] => {
        if (!(char in DONT_KEEP_MAP)) {
          str += char;
        }

        //REGEX match forward
        const isTextChild = jsx
          .substring(
            currentIndex - str.length + 1,
            currentIndex + str.length + 7
          )
          .search(MATCH_TEXT_CHILD);

        if (!str) {
          return ['', currentAttr];
        }

        if (char === ',') {
          //console.log('str', str);
          //console.log('currentAttr:', currentAttr && currentAttr.elemName);
        }

        if (char === '{' && !this.pastFirst) {
          return this.handleFirstOpeningBracket(str, currentAttr);
        } else if (char === '{') {
          return this.handleOpeningBracket(str, currentAttr);
        } else if (char === ',' && currentAttr && isTextChild >= 0) {
          //we need to handle possible text child here
          return this.handlePossibleTextChildAtStart(str, currentAttr);
        } else if (char === ',' && str.includes(':') && this.commaFlag) {
          return this.handleElem(str, currentAttr);
        } else if (char === '}') {
          return this.handleClosingBracket(str, currentAttr);
        } else if (char === '[') {
          this.possibleTextChild = true;
        } else if (char === ']') {
          //we should check if current string has text child.
        }

        return [str, currentAttr];
      };

      getEvents = (jsx: string) => {
        let currentAttr: Elem = {};
        let str = '';

        for (let i = 0; i < jsx.length; i++) {
          const char = jsx.charAt(i);

          [str, currentAttr] = this.handleChar(char, str, currentAttr, i, jsx);
        }
      };

      getTestObject = async (jsx: string): Promise<TestObject> => {
        const textHandler = new TextHandler(this.testObject);
        await textHandler.getTextElements(jsx);
        this.getEvents(jsx);
        return this.testObject;
      };
    }

    this.parseComponent = async (
      component: () => JSX.Element
    ): Promise<string[]> => {
      const compString = component.toString();
      const mainChild = compString.split(INIT_SPLIT).filter((item: string) => {
        return Boolean(item) && !item.startsWith(INIT_SLICE);
      });

      /*TODO: we should save eventLogic in case we want to attempt templates for event handling results*/
      const eventLogicString = mainChild.shift(); //removes logic from component string
      console.log('mainchidl', mainChild);

      let count = 1;
      return Promise.all(
        mainChild.map(async (jsx: string) => {
          const elems: Elem[] = [];
          const multiple: TextValue = {};
          const newTestObject = {
            name: component.name + ' ' + count++,
            elems,
            multiple,
          };
          const formatter = new Formatter();

          const parser = new ParserHelper(newTestObject);
          const testObj = await parser.getTestObject(jsx);
          // eslint-disable-next-line no-magic-numbers
          if (count == 3) console.log(JSON.stringify(testObj, undefined, 2));
          return formatter.formatTestObject(testObj);
        })
      );
    };
  }
}

export default Parser;
