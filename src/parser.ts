/* eslint-disable no-magic-numbers */
import {
  ParserI,
  BracketString,
  ChildList,
  ElemMap,
  TestObject,
  Attribute,
  TextChildren,
  TextMap,
} from './types';

const initialSplitRegex =
  /(return \(\(0, jsx_runtime_1\.jsxs\)\()|(return \(\(0, jsx_runtime_1\.jsx\)\()/gi;
const jsxRegex =
  /(\n)|(\(0, jsx_runtime_1\.jsxs\)\()|(\(0, jsx_runtime_1\.jsx\)\()/gi;
const initialSlice = 'return ((0, jsx_runtime_1.';

class Parser implements ParserI {
  parseComponent: (component: () => JSX.Element) => Promise<ChildList[]>;
  //cleanComponent: (component: () => JSX.Element) => ChildList;

  constructor() {
    class ParserHelper {
      testObject: TestObject;

      constructor() {
        this.testObject = {};
      }

      getJsxText = (jsx: string): TextChildren[] => {
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

      getPlaceholderText = (jsx: string): TextChildren[] => {
        const retrievePlaceholderText =
          /((?<=(placeholder: "))[a-zA-Z0-9_.",\s:-]+(?=" ))/gi;
        const results = Array.from(jsx.matchAll(retrievePlaceholderText));
        return this.getTextChildren(results);
      };

      getAltText = (jsx: string): TextChildren[] => {
        const retrieveAltText = /((?<=(alt: "))[a-zA-Z0-9_.",\s:-]+(?=" ))/gi;
        const results = Array.from(jsx.matchAll(retrieveAltText));
        return this.getTextChildren(results);
      };

      getTextChildren = (matchArray: RegExpMatchArray[]): TextChildren[] => {
        const textChildren: TextChildren[] = [];
        const map: TextMap = {};

        //build map object so we can specify findAllByText or findByText based on # of occurrences.
        for (const regArr of matchArray) {
          const str = regArr[0];

          if (str in map) {
            map[str]++;
          } else {
            map[str] = 1;
          }
        }

        //assign textChildren to testObject
        for (const [key, val] of Object.entries(map)) {
          const newTextChild: TextChildren = {
            multiple: val > 1,
            value: key,
          };
          textChildren.push(newTextChild);
        }

        return textChildren;
      };

      getTextElements = (jsx: string) => {
        this.testObject['jsxText'] = this.getJsxText(jsx);
        this.testObject['placeholderText'] = this.getPlaceholderText(jsx);
        this.testObject['altText'] = this.getAltText(jsx);
      };

      getTestObject = (jsx: string): TestObject => {
        this.getTextElements(jsx);

        return this.testObject;
      };
    }

    this.parseComponent = async (
      component: () => JSX.Element
    ): Promise<ChildList[]> => {
      const compString = component.toString();
      const mainChild = compString
        .split(initialSplitRegex)
        .filter((item: string) => {
          return Boolean(item) && !item.startsWith(initialSlice);
        });

      /*TODO: we should save eventLogic in case we want to attempt templates for event handling results*/
      const eventLogicString = mainChild.shift(); //removes logic from component string
      console.log('mainChild', mainChild);
      const jsxList = mainChild.map((jsx) => jsx.replaceAll(jsxRegex, ''));
      console.log('jsxList', jsxList);
      return Promise.all(
        jsxList.map(async (jsx: string) => {
          return new ParserHelper().getTestObject(jsx);
        })
      );
    };
  }
}

export default Parser;
