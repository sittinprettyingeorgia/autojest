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
const replaceRegex = /(children:)|,/gi;
class Parser implements ParserI {
  parseComponent: (component: () => JSX.Element) => ChildList;

  constructor() {
    class ParserHelper {
      testObject: TestObject;

      constructor() {
        this.testObject = {};
      }

      /*traverseJsonObj = (
        parentJsxName: string,
        parentJsxVal: any,
        isChildren: boolean
      ) => {
        if (isChildren && typeof parentJsx === 'string') {
          this.testObject.return;
        }

        for (const [key, val] of Object.entries(parentJsx)) {
        }
      };*/

      getTestObject = (jsx: any): ChildList => {
        const parentJsx: ChildList = jsx.div;

        return parentJsx;
      };
    }

    this.parseComponent = async (
      component: (props?: any) => JSX.Element
    ): Promise<ChildList[]> => {
      const compJson = this.cleanComponent(component);
      return Promise.all(
        compJson.map(async (item) => {
          return new ParserHelper().getTestObject(item);
        })
      );
    };
  }

  convertToJson = (jsx: string): any => {
    const attrRegex = /((([a-zA-Z]+)(\s)*(:)))(\s)*?([,]?)/gi;
    const parentheses = /[)(]+/gi;
    jsx = jsx.slice(0, jsx.indexOf(';'));
    const newStr = '{' + jsx + '}';
    let jsonStr = newStr.replaceAll(parentheses, '');
    jsonStr = jsonStr.replace(',', ':');
    jsonStr = jsonStr.replace(attrRegex, '"$3":');
    console.log(jsonStr);
    return JSON.parse(jsonStr);
  };

  cleanComponent = (component: () => JSX.Element): any[] => {
    const compString = component.toString();
    const mainChild = compString
      .split(initialSplitRegex)
      .filter((item: string) => {
        return Boolean(item) && !item.startsWith(initialSlice);
      });

    //TODO: we should save eventLogic in case we want to attempt templates for event handling results
    const eventLogicString = mainChild.shift();
    const jsxList = mainChild.map((jsx) => jsx.replaceAll(jsxRegex, ''));

    const result = jsxList.map((jsx: string) => {
      return this.convertToJson(jsx);
    });

    return result;
  };
}

export default Parser;
