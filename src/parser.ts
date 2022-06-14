import Formatter from 'formatter';
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
  parseComponent: (component: () => JSX.Element) => Promise<TestObject[]>;
  //cleanComponent: (component: () => JSX.Element) => ChildList;

  constructor() {
    class ParserHelper {
      testObject: TestObject;
      formatter: Formatter;
      constructor(formatter: Formatter, testObject: TestObject) {
        this.testObject = testObject;
        this.formatter = formatter;
      }

      handleNameFlag = (
        char: string,
        nameFlag: boolean,
        elemName: string
      ): [nameFlag: boolean, elemName: string, newElem: Attribute] => {
        if (char === '"' && !nameFlag) {
          return [true, '', undefined];
        } else if (char === '"' && nameFlag) {
          const newElem: Attribute = { elemName };
          return [false, '', newElem];
        }

        elemName += char;

        return [nameFlag, elemName, undefined];
      };

      /*handleEventFlag = (
        char: string,
        eventName: string
      ): [nameFlag: boolean, elemName: string, newElem: Attribute] => {
        const regex = 
        if (eventName.includes('on')) {
          return [true, '', undefined];
        } 

        return [nameFlag, elemName, undefined];
      };*/

      /*getEvents = (jsx: string) => {
        const event = '';
        const eventFlag = false;
        let nameFlag = false;
        let currentElem: Attribute;
        let elemName = '';
        for (let i = 0; i < jsx.length; i++) {
          const char = jsx.charAt(i);
          [nameFlag, elemName, newElem] = this.handleNameFlag(
            char,
            nameFlag,
            elemName
          );

        }
      };*/

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
        this.testObject['jsxText'] = await this.getJsxText(jsx);
        this.testObject['placeholderText'] = await this.getPlaceholderText(jsx);
        this.testObject['altText'] = await this.getAltText(jsx);
      };

      getTestObject = async (jsx: string): Promise<TestObject> => {
        await this.getTextElements(jsx);

        return this.testObject;
      };
    }

    this.parseComponent = async (
      component: () => JSX.Element
    ): Promise<TestObject[]> => {
      const compString = component.toString();
      const mainChild = compString
        .split(initialSplitRegex)
        .filter((item: string) => {
          return Boolean(item) && !item.startsWith(initialSlice);
        });

      /*TODO: we should save eventLogic in case we want to attempt templates for event handling results*/
      const eventLogicString = mainChild.shift(); //removes logic from component string
      const jsxList = mainChild.map((jsx) => jsx.replaceAll(jsxRegex, ''));
      console.log('jsxList', jsxList);

      return Promise.all(
        jsxList.map(async (jsx: string) => {
          const events: Attribute[] = [];
          const newTestObject = {
            events,
          };
          const formatter = new Formatter();

          return new ParserHelper(formatter, newTestObject).getTestObject(jsx);
        })
      );
    };
  }
}

export default Parser;
