/* eslint-disable no-magic-numbers */
import {
  DeprecatedParser,
  cleanComponentString as cleanComp1,
} from '../DeprecatedParser';
import { Parser } from '../Parser';
import App from '../app';

const TestComponent1 = () => {
  const handleClick = () => {
    console.log('hello');
  };

  return (
    <div data-testid="div1">
      <p>We have a paragraph1.</p>
      <span>We have a span 1</span>
      <span>
        <span>span within span</span>
      </span>
      <button onClick={handleClick}>inside button</button> outside button
    </div>
  );
};

const TestComponent2 = () => {
  const handleClick = () => {
    console.log('test');
  };

  return (
    <div data-testid="div1">
      <p>We have a paragraph1.</p>
      <span>1</span>
      <span>2</span>
      <span>3</span>
    </div>
  );
};

const TestComponent3 = () => {
  const handleClick = () => {
    console.log('test');
  };

  return (
    <div data-testid="div1">
      <p>We have a paragraph1.</p>
      <button onClick={handleClick}>inside button</button> outside button
      <span>span1</span>
      <span>span2</span>
      <span>span3</span>
      <span>span4</span>
      <span>span5</span>
      <span>span6</span>
      <span>span7</span>
      <span>span8</span>
    </div>
  );
};

export const Welcome = (props: any) => {
  return (
    <div>
      <div>
        <p>welcome paragraph</p>
        <div>
          <span>welcome span</span>
        </div>
      </div>
      <h1>Hello, {props.name}</h1>
    </div>
  );
};

describe('testing parser', () => {
  let parser: Parser;

  beforeEach(() => {
    parser = new Parser();
  });
  describe('testing cleanComponent method', () => {
    it('should correctly parse a simple functional component', async () => {
      const simpleComponent = await parser.parseComponent(TestComponent2);
      expect(simpleComponent).toEqual([
        {
          div: {
            'data-testid': 'div1',
            children: {
              p1: {
                children: {
                  'text-as-jsx-child': 'We have a paragraph1.',
                },
              },
              span: {
                children: {
                  'text-as-jsx-child': '1',
                },
              },
              span1: {
                children: {
                  'text-as-jsx-child': '2',
                },
              },
              span2: {
                children: {
                  'text-as-jsx-child': '3',
                },
              },
            },
          },
        },
      ]);
    });
    it('should correctly parse a nested functional component', async () => {
      const results = await parser.parseComponent(App);
      expect(results).toEqual([
        {
          div: {
            children: {
              div1: {
                children: {
                  p1: {
                    children: { 'text-as-jsx-child': 'This is div1 paragraph' },
                    onClick2: 'handleClick1',
                  },
                },
                'data-testid': 'div1',
                onClick1: 'handleClick1',
              },
              div2: {
                children: {
                  button: {
                    children: { 'text-as-jsx-child': 'change state1' },
                    onClick3: 'handleClick1',
                  },
                  p2: {
                    children: {
                      span: {
                        children: { 'text-as-jsx-child': 'This is a span1' },
                      },
                      'text-as-jsx-child': 'This is div2 paragraph.1',
                    },
                  },
                },
                'data-testid1': 'div2',
              },
            },
            onChange: 'handleClick1',
            onClick: 'handleClick1',
            onMouseEnter: 'handleClick1',
          },
        },
        {
          'react_1.Fragment': {
            div1: {
              children: {
                button: {
                  children: { 'text-as-jsx-child': 'change state 3' },
                  onClick: 'handleClick2',
                },
                p1: {
                  children: {
                    span: {
                      children: { 'text-as-jsx-child': 'This is a span3' },
                    },
                    'text-as-jsx-child': 'This is a paragraph3.1',
                  },
                },
              },
              'data-testid': 'div3',
            },
          },
        },
      ]);
    });
  });
});
