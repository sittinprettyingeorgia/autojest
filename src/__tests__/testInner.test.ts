import {
  handleElem,
  handleFirstOpeningBracket,
  handleKeyVal,
  handleOpeningBracket,
} from 'testInner';
import { Elem } from 'types';
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

describe('Testing inner functions', () => {
  let attr: Elem;

  beforeEach(() => {
    attr = {};
  });

  describe('testing handleFirstOpeningBracket', () => {
    let newAttr: Elem;
    let bracketStr: string;
    beforeEach(() => {
      newAttr = {};
    });

    it('should correctly assign a simple elemName to our current Elem', () => {
      bracketStr = '"div", ';
      const [str, currentAttr] = handleFirstOpeningBracket(bracketStr, newAttr);
      expect(currentAttr.elemName).toBe('div');
    });
    it('should correctly assign an elemName with jsx to our current Elem', () => {
      bracketStr = 'react_1.Fragment, ';
      const [str, currentAttr] = handleFirstOpeningBracket(bracketStr, newAttr);
      expect(currentAttr.elemName).toBe('react_1.Fragment');
    });
    it('should correctly assign an elemName with jsx to our current Elem', () => {
      bracketStr = 'react_1.Fra:gment, ';
      const [str, currentAttr] = handleFirstOpeningBracket(bracketStr, newAttr);
      expect(currentAttr.elemName).toBe('react_1.Fragment');
    });
  });

  describe('testing handleOpeningBracket', () => {
    let currentAttr: Elem;
    let bracketStr1: string;
    let elemStackResult: Elem[];
    let newAttrResults: Elem[];

    beforeEach(() => {
      currentAttr = {};
    });

    it('should correctly assign a jsx elemName to a current Elem and push current Elem on stack', () => {
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
      let elemStack: Elem[] = [];
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
    it('should correctly assign a jsxs elemName to a current Elem', () => {
      const bracketStrs = [
        ' (0, jsx_runtime_1.jsxs)("div", ',
        '(0, jsx_runtime_1.jsxs)("label",',
        ' children: (0, jsx_runtime_1.jsxs)("div", ',
        ' (0, jsx_runtime_1.jsx)("span", ',
        'children: [(0, jsx_runtime_1.jsx)("input"',
      ];
      let elemStack: Elem[] = [];
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
    it('should return an empty string and currentAttr if str is empty or null', () => {
      currentAttr = {};
      let elemStack: Elem[] = [];
      const [str, newAttr] = handleOpeningBracket('', currentAttr, elemStack);
      expect(str).toEqual('');
      expect(newAttr).toBe(currentAttr);
    });
    it('should add currentAttr to stack', () => {
      currentAttr = {};
      let elemStack: Elem[] = [];
      const [str, newAttr] = handleOpeningBracket(
        'testName',
        currentAttr,
        elemStack
      );
      expect(str).toEqual('');
      expect(newAttr).toEqual({ elemName: 'testName' });
      expect(elemStack.length).toEqual(1);
    });
  });

  describe('testing handleKeyVal ', () => {
    it('should split an elements Elems keys correctly', () => {
      const strs = [
        ' onClick: handleClick1',
        'onChange: handleClick1',
        'onMouseEnter: handleClick1',
        'placeholder: "test placeholder1"',
        'type: "    text"',
        'alt: "alt image desc"',
        'children: " childrenText "',
      ];
      const expectedResults = [
        ['onClick', 'handleClick1'],
        ['onChange', 'handleClick1'],
        ['onMouseEnter', 'handleClick1'],
        ['PlaceholderText', 'test placeholder1'],
        ['type', 'text'],
        ['AltText', 'alt image desc'],
        ['Text', 'childrenText'],
      ];

      for (let i = 0; i < strs.length; i++) {
        const [key, val] = handleKeyVal(strs[i]);
        const [expectedKey, expectedVal] = expectedResults[i];

        expect(key).toEqual(expectedKey);
        expect(val).toEqual(expectedVal);
      }
    });
  });
  describe('testing handleAttribtue', () => {
    let currentAttr: Elem;
    let bracketStr1: string;
    let elemStackResult: Elem[];
    let newAttrResults: Elem[];

    beforeEach(() => {
      currentAttr = {};
    });

    it('should add an Elem to the currentAttr elem', () => {
      currentAttr = {};
      const strs = [
        ' onClick: handleClick1',
        'onChange: handleClick1',
        'onMouseEnter: handleClick1',
        'placeholder: "test placeholder1"',
        'type: "    text"',
        'alt: "alt image desc"',
        'children: " childrenText "',
      ];
      const expectedResults: Elem[] = [
        { onClick: 'handleClick1' },
        { onChange: 'handleClick1' },
        { onMouseEnter: 'handleClick1' },
        { PlaceholderText: 'test placeholder1' },
        { type: 'text' },
        { AltText: 'alt image desc' },
        { Text: 'childrenText' },
      ];
      let elemStack: Elem[] = [];
      for (let i = 0; i < strs.length; i++) {
        const [str, newAttr] = handleElem(strs[i], currentAttr);
        const [newAttrKey, newAttrVal] = Object.entries(expectedResults[i]);

        expect(str).toEqual('');
        expect(newAttr[newAttrKey as unknown as keyof Elem]).toEqual(
          newAttrVal
        );
      }
    });
  });

  describe('testing getParent', () => {
    it('should return the parent elem of our current elem or a new elem object', () => {});
  });
});
