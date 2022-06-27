import Formatter from './formatter';
import { Attribute, ParserI, TestObject, TextMap, TextValue } from './types';

const INIT_SPLIT =
  /(return \(\(0, jsx_runtime_1\.jsxs\)\()|(return \(\(0, jsx_runtime_1\.jsx\)\()/gi;
const JSX_REGEX =
  /(\n)|(\(0, jsx_runtime_1\.jsxs\)\()|(\(0, jsx_runtime_1\.jsx\)\()/gi;
const INIT_SLICE = 'return ((0, jsx_runtime_1.';
const ZERO = 0;
const ONE = 1;
const ON_CLICK_REGEX =
  /(")[}a-zA-Z0-9{_.",\s:-]+(")[:,]+(?=[}a-zA-Z0-9{_.",\s:-]*\bonClick\b)/gi;
const ON_CHANGE_REGEX =
  /(")[}a-zA-Z0-9{_.",\s:-]+(")[:,]+(?=[}a-zA-Z0-9{_.",\s:-]*\bonChange\b)/gi;
const ON_MOUSE_OVER_REGEX =
  /(")[}a-zA-Z0-9{_.",\s:-]+(")[:,]+(?=[}a-zA-Z0-9{_.",\s:-]*\bonMouseOver\b)/gi;
const ON_MOUSE_DOWN_REGEX =
  /(")[}a-zA-Z0-9{_.",\s:-]+(")[:,]+(?=[}a-zA-Z0-9{_.",\s:-]*\bonMouseDown\b)/gi;
const ON_MOUSE_OUT_REGEX =
  /(")[}a-zA-Z0-9{_.",\s:-]+(")[:,]+(?=[}a-zA-Z0-9{_.",\s:-]*\bonMouseOut\b)/gi;
const ON_KEYDOWN_REGEX =
  /(")[}a-zA-Z0-9{_.",\s:-]+(")[:,]+(?=[}a-zA-Z0-9{_.",\s:-]*\bonKeyDown\b)/gi;
const ON_KEYPRESS_REGEX =
  /(")[}a-zA-Z0-9{_.",\s:-]+(")[:,]+(?=[}a-zA-Z0-9{_.",\s:-]*\bonKeyPress\b)/gi;
const ON_INPUT_REGEX =
  /(")[}a-zA-Z0-9{_.",\s:-]+(")[:,]+(?=[}a-zA-Z0-9{_.",\s:-]*\bonInput\b)/gi;
const DATA_TEST_ID_REGEX =
  /(")[}a-zA-Z0-9{_.",\s:-]+(")[:,]+(?=[}a-zA-Z0-9{_.",\s:-]*\bdataTestId\b)/gi;
const ROLE_REGEX =
  /(")[}a-zA-Z0-9{_.",\s:-]+(")[:,]+(?=[}a-zA-Z0-9{_.",\s:-]*\brole\b)/gi;
const SINGLE_CHILD = '(0, jsx_runtime_1.jsx)("';
const MULTIPLE_CHILD = '(0, jsx_runtime_1.jsxs)("';
const SINGLE = 'jsx_runtime_1.jsx';
const MULTI = 'jsx_runtime_1.jsxs';
const CHILDREN_KEY = '/children: ';
const DONT_KEEP_REGEX = /[",\]0)([':]+/gi;
const DONT_KEEP_MAP = {
  '{': '{',
  '}': '{',
  '[': '[',
  ']': ']',
  ';': ';',
  '"': '"',
};

class Parser implements ParserI {
  parseComponent: (component: () => JSX.Element) => Promise<string[]>;

  constructor() {
    class ParserHelper {
      testObject: TestObject;
      elemStack: Attribute[];
      pastFirst: boolean;
      commaFlag: boolean;

      constructor(testObject: TestObject) {
        this.testObject = testObject;
        this.elemStack = [];
        this.pastFirst = false;
        this.commaFlag = false;
      }

      handleFirstOpeningBracket = (
        str: string,
        currentAttr: Attribute
      ): [str: string, newAttr: Attribute] => {
        //we need to assign current str as the name of our first attribute
        currentAttr.elemName = str.trim().replaceAll(DONT_KEEP_REGEX, '');
        str = '';
        this.pastFirst = true; //are we past the mainChild?
        this.commaFlag = true; //are we within an elements attributes or not.

        return [str, currentAttr];
      };

      handleOpeningBracket = (
        str: string,
        currentAttr: Attribute
      ): [str: string, newAttr: Attribute] => {
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
        const newAttr: Attribute = {};
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

      handleAttribute = (
        str: string,
        currentAttr: Attribute
      ): [str: string, newAttr: Attribute] => {
        //we need to handle attribute assignment(onclick,data-testid, etc)
        str = str.replaceAll('"', '');
        let [key, val] = str.split(':');
        key = key.trim().replaceAll(DONT_KEEP_REGEX, '');
        val = val ? val.trim().replaceAll(DONT_KEEP_REGEX, '') : val;

        if (key && val) currentAttr[key.trim() as keyof Attribute] = val.trim();

        return ['', currentAttr];
      };

      handleElems = (
        currentAttr: Attribute,
        parentElem: Attribute,
        str: string
      ): void => {
        const [key, val] = this.handleKeyVal(str);

        if (key && val) currentAttr[key as keyof Attribute] = val;

        if (
          currentAttr != null &&
          !(this.testObject.elems as Attribute[]).includes(currentAttr)
        )
          (this.testObject.elems as Attribute[]).push(currentAttr);

        this.commaFlag = false;

        if (
          !this.elemStack.length &&
          parentElem != null &&
          !(this.testObject.elems as Attribute[]).includes(parentElem)
        ) {
          (this.testObject.elems as Attribute[]).push(parentElem);
        }
      };

      handleClosingBracket = (
        str: string,
        currentAttr: Attribute
      ): [str: string, newAttr: Attribute] => {
        //we need to close up currentAttr and retrieve last elem from stack in case attributes are placed at end of elem
        let parentElem: Attribute;
        if (this.elemStack.length) {
          parentElem = this.elemStack.pop();
        }

        this.handleElems(currentAttr, parentElem, str);

        return ['', parentElem]; //parentElem may be undefined
      };

      handleChar = (
        char: string,
        str: string,
        currentAttr: Attribute
      ): [str: string, newAttr: Attribute] => {
        if (!(char in DONT_KEEP_MAP)) {
          str += char;
        }

        if (char === '{' && !this.pastFirst) {
          return this.handleFirstOpeningBracket(str, currentAttr);
        } else if (char === '{') {
          return this.handleOpeningBracket(str, currentAttr);
        } else if (char === ',' && str && str.includes(':') && this.commaFlag) {
          return this.handleAttribute(str, currentAttr);
        } else if (char === '}') {
          return this.handleClosingBracket(str, currentAttr);
        }

        return [str, currentAttr];
      };

      getEvents = (jsx: string) => {
        let currentAttr: Attribute = {};
        let str = '';

        for (let i = 0; i < jsx.length; i++) {
          const char = jsx.charAt(i);

          [str, currentAttr] = this.handleChar(char, str, currentAttr);
        }
      };

      getJsxText = async (jsx: string): Promise<TextValue> => {
        //retrieves visible text
        const retrieveJsxText =
          /((?<=(children: "))[a-zA-Z0-9_.",\s:-]+(?=" ))/gi;
        const retrieveJsxsStartAndMiddleText =
          /([a-zA-Z0-9_.,\s:-]+(?=", "))/gi;
        const retrieveJsxsEndText = /((?<=("))[a\]-zA-Z0-9_.,\s:-]+(?="]))/gi;
        const retrieveJsxOutsideText = /([a-zA-Z0-9_.,\s:-]+(?=", \())/gi;
        const results = [
          ...jsx.matchAll(retrieveJsxText),
          ...jsx.matchAll(retrieveJsxsStartAndMiddleText),
          ...jsx.matchAll(retrieveJsxsEndText),
          ...jsx.matchAll(retrieveJsxOutsideText),
        ];

        return this.getTextChildren(results);
      };

      getPlaceholderText = async (jsx: string): Promise<TextValue> => {
        const retrievePlaceholderText =
          /((?<=(placeholder: "))[a-zA-Z0-9_.",\s:-]+(?=" ))/gi;
        const results = Array.from(jsx.matchAll(retrievePlaceholderText));
        return this.getTextChildren(results);
      };

      getAltText = async (jsx: string): Promise<TextValue> => {
        const retrieveAltText = /((?<=(alt: "))[a-zA-Z0-9_.",\s:-]+(?=" ))/gi;
        const results = Array.from(jsx.matchAll(retrieveAltText));
        return this.getTextChildren(results);
      };

      getTextChildren = async (
        matchArray: RegExpMatchArray[]
      ): Promise<TextValue> => {
        const textChildren: TextValue = {};
        const map: TextMap = {};

        //build map object so we can specify findAllByText or findByText based on # of occurrences.
        for (const regArr of matchArray) {
          const str = regArr[ZERO];

          if (str in map) {
            map[str]++;
          } else {
            map[str] = 1;
          }
        }

        //assign textChildren to testObject
        for (const [key, val] of Object.entries(map)) {
          const multi = val > ONE;
          textChildren[key] = multi;
          if (multi) {
            (this.testObject.multiple as TextValue)[key] = multi;
          }
        }

        return textChildren;
      };

      getTextElements = async (jsx: string): Promise<void> => {
        const [def, placeholder, alt] = await Promise.all([
          this.getJsxText(jsx),
          this.getPlaceholderText(jsx),
          this.getAltText(jsx),
        ]);

        this.testObject['Text'] = def;
        this.testObject['PlaceholderText'] = placeholder;
        this.testObject['AltText'] = alt;
      };

      getTestObject = async (jsx: string): Promise<TestObject> => {
        await this.getTextElements(jsx);
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
          const elems: Attribute[] = [];
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
          console.log(JSON.stringify(testObj, undefined, 2));
          return formatter.formatTestObject(testObj);
        })
      );
    };
  }
}

export default Parser;
