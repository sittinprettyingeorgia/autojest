import { handleFirstOpeningBracket, handleOpeningBracket } from 'testInner';
import { Attribute } from 'types';
import {
  DONT_KEEP_REGEX,
  CHILDREN_KEY,
  MULTIPLE_CHILD,
  SINGLE_CHILD,
  MULTI,
  SINGLE,
  DONT_KEEP_MAP,
  MATCH_TEXT_CHILD,
} from 'constant';
import { jsxAttribute } from '@babel/types';

describe('Testing inner functions', () => {
  let attr: Attribute;

  beforeEach(() => {
    attr = {};
  });

  describe('testing handleFirstOpeningBracket', () => {
    let newAttr: Attribute;
    let bracketStr: string;
    beforeEach(() => {
      newAttr = {};
    });

    it('should correctly assign a simple elemName to our current Attribute', () => {
      bracketStr = '"div", ';
      const [str, currentAttr] = handleFirstOpeningBracket(bracketStr, newAttr);
      expect(currentAttr.elemName).toBe('div');
    });
    it('should correctly assign an elemName with jsx to our current Attribute', () => {
      bracketStr = 'react_1.Fragment, ';
      const [str, currentAttr] = handleFirstOpeningBracket(bracketStr, newAttr);
      expect(currentAttr.elemName).toBe('react_1.Fragment');
    });
    it('should correctly assign an elemName with jsx to our current Attribute', () => {
      bracketStr = 'react_1.Fra:gment, ';
      const [str, currentAttr] = handleFirstOpeningBracket(bracketStr, newAttr);
      expect(currentAttr.elemName).toBe('react_1.Fragment');
    });
  });

  describe('testing handleOpeningBracket', () => {
    let currentAttr: Attribute;
    let bracketStr1: string;
    let elemStackResult: Attribute[];
    let newAttrResults: Attribute[];

    beforeEach(() => {
      currentAttr = {};
    });

    it('should correctly assign a jsx elemName to a current Attribute and push current Attribute on stack', () => {
      bracketStr1 = '(0, jsx_runtime_1.jsx)("input", ';
      currentAttr = {
        elemName: 'test',
      };
      elemStackResult = [{ elemName: 'test' }];
      newAttrResults = [
        {
          elemName: 'input',
        },
      ];
      let elemStack: Attribute[] = [];
      const [str, newAttr] = handleOpeningBracket(
        bracketStr1,
        currentAttr,
        elemStack
      );
      expect(newAttr.elemName).toBe('input');
      expect(elemStack.length).toBe(1);
      expect(elemStack).toEqual(elemStackResult);
      expect(newAttr).toEqual(newAttrResults[0]);
    });
    it('should correctly assign a jsxs elemName to a current Attribute', () => {
      const bracketStrs = [
        ' (0, jsx_runtime_1.jsxs)("div", ',
        '(0, jsx_runtime_1.jsxs)("label",',
        ' children: (0, jsx_runtime_1.jsxs)("div", ',
        ' (0, jsx_runtime_1.jsx)("span", ',
        'children: [(0, jsx_runtime_1.jsx)("input"',
      ];
      let elemStack: Attribute[] = [];
      currentAttr = {
        elemName: 'test',
      };
      newAttrResults = [
        {
          elemName: 'div',
        },
        {
          elemName: 'label',
        },
        {
          elemName: 'div',
        },
        {
          elemName: 'span',
        },
        {
          elemName: 'input',
        },
      ];

      for (let i = 0; i < bracketStrs.length; i++) {
        const [str, newAttr] = handleOpeningBracket(
          bracketStrs[i],
          currentAttr,
          elemStack
        );
        //TODO: childrenKey regex is failing
        expect(newAttr.elemName).toBe(newAttrResults[i].elemName);
        expect(newAttr).toEqual(newAttrResults[i]);
        expect(str).toBe('');
      }
    });
  });
});
