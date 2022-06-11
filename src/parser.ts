/* eslint-disable no-magic-numbers */
import {
  ParserI,
  BracketString,
  ChildList,
  ElemMap,
  TestObject,
  Attribute,
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

      getTextChildren = (jsx: string) => {
        //retrieves visible text
        const retrieveJsxText =
          /((?<=(children: "))[a-zA-Z0-9_.",\s:-]+(?=" ))/g;
        const retrieveJsxsStartAndMiddleText = /([a-zA-Z0-9_.,\s:-]+(?=", "))/g;
        const retrieveJsxsEndText = /((?<=("))[a\]-zA-Z0-9_.,\s:-]+(?="]))/g;
        const textMatchers = [
          ...jsx.matchAll(retrieveJsxText),
          ...jsx.matchAll(retrieveJsxsStartAndMiddleText),
          ...jsx.matchAll(retrieveJsxsEndText),
        ];

        const textChildren: string[] = [];
        for (const textMatcher of textMatchers) {
          textChildren.push(textMatcher.values().next().value);
        }

        console.log('textChildren', textChildren);
        return textChildren;
      };

      convertToJson = (jsx: string): string[] => {
        const textChildren = this.getTextChildren(jsx);

        return textChildren;
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
      const jsxList = mainChild.map((jsx) => jsx.replaceAll(jsxRegex, ''));

      return Promise.all(
        jsxList.map(async (jsx: string) => {
          return new ParserHelper().getTextChildren(jsx);
        })
      );
    };
  }
}

export default Parser;
