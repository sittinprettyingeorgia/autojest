import Formatter from './formatter';
import { Attribute, ParserI, TestObject, TextChildren, TextMap } from './types';

const initialSplitRegex =
  /(return \(\(0, jsx_runtime_1\.jsxs\)\()|(return \(\(0, jsx_runtime_1\.jsx\)\()/gi;
const jsxRegex =
  /(\n)|(\(0, jsx_runtime_1\.jsxs\)\()|(\(0, jsx_runtime_1\.jsx\)\()/gi;
const initialSlice = 'return ((0, jsx_runtime_1.';
const ZERO = 0;
const ONE = 1;
const onClickRegex =
  /(")[}a-zA-Z0-9{_.",\s:-]+(")[:,]+(?=[}a-zA-Z0-9{_.",\s:-]*\bonClick\b)/gi;
const onChangeRegex =
  /(")[}a-zA-Z0-9{_.",\s:-]+(")[:,]+(?=[}a-zA-Z0-9{_.",\s:-]*\bonChange\b)/gi;
const onMouseOverRegex =
  /(")[}a-zA-Z0-9{_.",\s:-]+(")[:,]+(?=[}a-zA-Z0-9{_.",\s:-]*\bonMouseOver\b)/gi;
const onMouseDownRegex =
  /(")[}a-zA-Z0-9{_.",\s:-]+(")[:,]+(?=[}a-zA-Z0-9{_.",\s:-]*\bonMouseDown\b)/gi;
const onMouseOutRegex =
  /(")[}a-zA-Z0-9{_.",\s:-]+(")[:,]+(?=[}a-zA-Z0-9{_.",\s:-]*\bonMouseOut\b)/gi;
const onKeyDownRegex =
  /(")[}a-zA-Z0-9{_.",\s:-]+(")[:,]+(?=[}a-zA-Z0-9{_.",\s:-]*\bonKeyDown\b)/gi;
const onKeyPressRegex =
  /(")[}a-zA-Z0-9{_.",\s:-]+(")[:,]+(?=[}a-zA-Z0-9{_.",\s:-]*\bonKeyPress\b)/gi;
const onInputRegex =
  /(")[}a-zA-Z0-9{_.",\s:-]+(")[:,]+(?=[}a-zA-Z0-9{_.",\s:-]*\bonInput\b)/gi;
const dataTestIdRegex =
  /(")[}a-zA-Z0-9{_.",\s:-]+(")[:,]+(?=[}a-zA-Z0-9{_.",\s:-]*\bdataTestId\b)/gi;
const roleRegex =
  /(")[}a-zA-Z0-9{_.",\s:-]+(")[:,]+(?=[}a-zA-Z0-9{_.",\s:-]*\brole\b)/gi;
class Parser implements ParserI {
  parseComponent: (component: () => JSX.Element) => Promise<string[]>;

  constructor() {
    class ParserHelper {
      testObject: TestObject;
      elemStack: Attribute[];

      constructor(testObject: TestObject) {
        this.testObject = testObject;
        this.elemStack = [];
      }

      singleChild = '(0, jsx_runtime_1.jsx)("';
      multipleChild = '(0, jsx_runtime_1.jsxs)("';
      childrenKey = 'children: ';
      dontKeep = /[",\][':\s]+/;

      handleFirstOpeningBracket = (
        str: string,
        currentAttr: Attribute
      ): [str: string, newAttr: Attribute] => {
        //we need to assign current str as the name of our first attribute
        //remove any quotes and assign name
        str = str.replaceAll('"', '');
        str = str.replaceAll("'", '');

        currentAttr.elemName = str;
        str = '';
        return [str, currentAttr];
      };

      handleOpeningBracket = (
        str: string,
        currentAttr: Attribute
      ): [str: string, newAttr: Attribute] => {
        //we need to remove all unused chars
        str = str.replaceAll(this.childrenKey, '');
        str = str.includes(this.singleChild)
          ? str.replaceAll(this.singleChild, '')
          : str.replaceAll(this.multipleChild, '');
        str = str.replaceAll(this.dontKeep, '');

        //we need to push our parent attr on the stack and assign a new currentAttr
        this.elemStack.push(currentAttr);
        const newAttr: Attribute = {};
        newAttr.elemName = str;

        return ['', newAttr];
      };

      handleAttribute = (
        str: string,
        currentAttr: Attribute
      ): [str: string, newAttr: Attribute] => {
        //we need to handle attribute assignment(onclick,data-testid, etc)
        str = str.replaceAll('"', '');
        const [key, val] = str.split(':');
        currentAttr[key.trim() as keyof Attribute] = val.trim();

        return ['', currentAttr];
      };

      handleClosingBracket = (
        str: string,
        currentAttr: Attribute
      ): [str: string, newAttr: Attribute] => {
        //we need to close up currentAttr and retrieve last elem from stack in case attributes are placed at end of elem
        const parentElem = this.elemStack.pop();
        const [key, val] = str.split(':');
        currentAttr[key as keyof Attribute] = val;
        (this.testObject.elems as Attribute[]).push(currentAttr);
        return ['', parentElem];
      };

      handleChar = (
        char: string,
        str: string,
        currentAttr: Attribute
      ): [str: string, newAttr: Attribute] => {
        if (char === ',' && str.trim() && str.includes(':')) {
          return this.handleAttribute(str, currentAttr);
        } else if (char === '{' && !this.elemStack.length) {
          return this.handleFirstOpeningBracket(str, currentAttr);
        } else if (char === '{') {
          return this.handleOpeningBracket(str, currentAttr);
        } else if (char === '}') {
          return this.handleClosingBracket(str, currentAttr);
        }
      };

      getEvents = (jsx: string) => {
        let currentAttr: Attribute = {};
        let str = '';
        for (let i = 0; i < jsx.length; i++) {
          const char = jsx.charAt(i);
          if (char === '(' || char === ')') continue;

          [str, currentAttr] = this.handleChar(char, str, currentAttr);
        }
      };

      getJsxText = async (jsx: string): Promise<TextChildren[]> => {
        //retrieves visible text
        const retrieveJsxText =
          /((?<=(children: "))[a-zA-Z0-9_.",\s:-]+(?=" ))/gi;
        const retrieveJsxsStartAndMiddleText =
          /([a-zA-Z0-9_.,\s:-]+(?=", "))/gi;
        const retrieveJsxsEndText = /((?<=("))[a\]-zA-Z0-9_.,\s:-]+(?="]))/gi;
        const results = [
          ...jsx.matchAll(retrieveJsxText),
          ...jsx.matchAll(retrieveJsxsStartAndMiddleText),
          ...jsx.matchAll(retrieveJsxsEndText),
        ];

        return this.getTextChildren(results);
      };

      getPlaceholderText = async (jsx: string): Promise<TextChildren[]> => {
        const retrievePlaceholderText =
          /((?<=(placeholder: "))[a-zA-Z0-9_.",\s:-]+(?=" ))/gi;
        const results = Array.from(jsx.matchAll(retrievePlaceholderText));
        return this.getTextChildren(results);
      };

      getAltText = async (jsx: string): Promise<TextChildren[]> => {
        const retrieveAltText = /((?<=(alt: "))[a-zA-Z0-9_.",\s:-]+(?=" ))/gi;
        const results = Array.from(jsx.matchAll(retrieveAltText));
        return this.getTextChildren(results);
      };

      getTextChildren = async (
        matchArray: RegExpMatchArray[]
      ): Promise<TextChildren[]> => {
        const textChildren: TextChildren[] = [];
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
          const newTextChild: TextChildren = {
            multiple: val > ONE,
            value: key,
          };
          textChildren.push(newTextChild);
        }

        return textChildren;
      };

      getTextElements = async (jsx: string): Promise<void> => {
        this.testObject['Text'] = await this.getJsxText(jsx);
        this.testObject['PlaceholderText'] = await this.getPlaceholderText(jsx);
        this.testObject['AltText'] = await this.getAltText(jsx);
      };

      getTestObject = async (jsx: string): Promise<TestObject> => {
        await this.getTextElements(jsx);

        return this.testObject;
      };
    }

    this.parseComponent = async (
      component: () => JSX.Element
    ): Promise<string[]> => {
      const compString = component.toString();
      const mainChild = compString
        .split(initialSplitRegex)
        .filter((item: string) => {
          return Boolean(item) && !item.startsWith(initialSlice);
        });

      /*TODO: we should save eventLogic in case we want to attempt templates for event handling results*/
      const eventLogicString = mainChild.shift(); //removes logic from component string
      console.log('mainChild', mainChild);
      let count = 1;
      return Promise.all(
        mainChild.map(async (jsx: string) => {
          const elems: Attribute[] = [];
          const newTestObject = {
            name: component.name + ' ' + count++,
            elems,
          };
          const formatter = new Formatter();

          const parser = new ParserHelper(newTestObject);
          const testObj = await parser.getTestObject(jsx);
          console.log(testObj);
          return formatter.formatTestObject(testObj);
        })
      );
    };
  }
}

export default Parser;
