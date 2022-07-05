import { ONE, ZERO } from 'constant';
import { TestObject, TextHandlerI, TextMap, TextValue } from 'types';

class TextHandler implements TextHandlerI {
  testObject: TestObject;
  constructor(testObject: TestObject) {
    this.testObject = testObject;
  }

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

  getJsxText = async (jsx: string): Promise<TextValue> => {
    //retrieves visible text
    const retrieveJsxText = /((?<=(children: "))[a-zA-Z0-9_.",\s:-]+(?=" ))/gi;
    const retrieveJsxsStartAndMiddleText = /([a-zA-Z0-9_.,\s:-]+(?=", "))/gi;
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

  getTextElements = async (jsx: string): Promise<TestObject> => {
    const [def, placeholder, alt] = await Promise.all([
      this.getJsxText(jsx),
      this.getPlaceholderText(jsx),
      this.getAltText(jsx),
    ]);

    this.testObject['Text'] = def;
    this.testObject['PlaceholderText'] = placeholder;
    this.testObject['AltText'] = alt;
    return this.testObject;
  };
}

export default TextHandler;
