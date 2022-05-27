/* eslint-disable no-magic-numbers */
import App from '../app';
import {
  Parser,
  cleanComponentString,
  handleClosingBracket,
  handleOpeningBracket,
  getChildren,
} from '../parser';

//jsxChildren for parsed App component.
const jsxChild1 = {
  div1: {
    onClick: 'handleClick1',
    onChange: 'handleClick1',
    onMouseEnter: 'handleClick1',
    children: {
      div1: {
        onClick: 'handleClick1',
        'data-testid': 'div1',
        children: {
          p1: {
            onClick: 'handleClick1',
            children: {
              'text-as-jsx-child': 'Thisisdiv1paragraph',
            },
          },
        },
      },
      div2: {
        'data-testid': 'div2',
        children: {
          p1: {
            children: {
              'text-as-jsx-child': 'Thisisdiv2paragraph.',
              span1: {
                children: {
                  'text-as-jsx-child': 'Thisisaspan1',
                },
              },
            },
          },
          button1: {
            onClick: 'handleClick1',
            children: {
              'text-as-jsx-child': 'changestate1',
            },
          },
        },
      },
    },
  },
};
const jsxChild2 = {
  'react_1.Fragment1': {
    children: {
      div1: {
        'data-testid': 'div3',
        children: {
          p1: {
            children: {
              'text-as-jsx-child': 'Thisisaparagraph3.',
              span1: {
                children: {
                  'text-as-jsx-child': 'Thisisaspan3',
                },
              },
            },
          },
          button1: {
            onClick: 'handleClick2',
            children: {
              'text-as-jsx-child': 'changestate3',
            },
          },
        },
      },
    },
  },
};
const ZERO = 0;
const testComponent = () => {
  return (
    <div data-testid="div1">
      <p>We have a paragraph1.</p>
      <span>We have a span 1</span>
    </div>
  );
};

describe('testing parser', () => {
  describe('testing getChildren function', () => {
    it('should return comp', async () => {
      const compString = cleanComponentString(App);
      const [result, _] = await getChildren(ZERO, '', compString[ZERO], {});
      console.log('result', JSON.stringify(result, undefined, 2));
      expect(result).not.toBeNull();
    });
  });
  describe('testing parseComponent function', () => {
    it('should generate a component obj', async () => {
      const parser = new Parser();
      const parseResults = await parser.parseComponent(App);
      expect(parseResults.length).toBe(2);
      /*expect(parseResults[0]).toEqual(jsxChild1);
      expect(parseResults[1]).toEqual(jsxChild2);*/
    });
  });
});
