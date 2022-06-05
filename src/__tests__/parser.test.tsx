/* eslint-disable no-magic-numbers */
import Parser from '../Parser';
import { Fragment, useState } from 'react';

const TestApp = () => {
  const [state1, setState1] = useState(false);
  const [state2, setState2] = useState(false);

  const handleClick1 = () => {
    setState1(!state1);
  };

  const handleClick2 = () => {
    setState2(!state2);
  };

  if (state1) {
    return (
      <div
        onClick={handleClick1}
        onChange={handleClick1}
        onMouseEnter={handleClick1}
      >
        <div onClick={handleClick1} data-testid="div1">
          <p onClick={handleClick1}>This is div1 paragraph</p>
        </div>
        <div data-testid="div2">
          <p>
            This is div2 paragraph.<span>This is a span1</span>
          </p>
          <button onClick={handleClick1}>change state1</button>
        </div>
      </div>
    );
  } else {
    return (
      <Fragment>
        <div data-testid="div3">
          <p>
            This is a paragraph3.<span>This is a span3</span>
          </p>
          <button onClick={handleClick2}>change state 3</button>
        </div>
      </Fragment>
    );
  }
};

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

const WelcomeTest = (props: any) => {
  return (
    <div>
      <div>
        <p>welcome</p>paragraph
        <div>
          <span>welcome span</span>outside text
        </div>
      </div>
      <h1>Hello, {props.name}</h1>
    </div>
  );
};

const SimpleTextOutsideJsx = () => {
  return (
    <div>
      <p>inside</p>outside
    </div>
  );
};

const cleanComp2TestResult = [
  '"div", { "data-testid": "div1", children: ["p", { children: "We have a paragraph1." }), "span", { children: "1" }), "span", { children: "2" }), "span", { children: "3" })] }))',
];

const cleanTestAppTestResult = [
  '"div", { onClick: handleClick1, onChange: handleClick1, onMouseEnter: handleClick1, children: ["div", { onClick: handleClick1, "data-testid": "div1", children: "p", { onClick: handleClick1, children: "This is div1 paragraph" }) }), "div", { "data-testid": "div2", children: ["p", { children: ["This is div2 paragraph.", "span", { children: "This is a span1" })] }), "button", { onClick: handleClick1, children: "change state1" })] })] }))',
  'react_1.Fragment, { children: "div", { "data-testid": "div3", children: ["p", { children: ["This is a paragraph3.", "span", { children: "This is a span3" })] }), "button", { onClick: handleClick2, children: "change state 3" })] }) }))',
];

const cleanTestWelcomeTest = [
  '"div", { children: ["div", { children: ["p", { children: "welcome" }), "paragraph", "div", { children: ["span", { children: "welcome span" }), "outside text"] })] }), "h1", { children: ["Hello, ", props.name] })] }))',
];

const testCleanSimpleTextOutsideJsx = [
  '"div", { children: ["p", { children: "inside" }), "outside"] }))',
];

const testParseComp2TestResult = [
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
];

const testParseAppTestResult = [
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
];

const testParseSimpleTextOutsideJsx = [
  {
    div: {
      children: {
        p1: { children: { 'text-as-jsx-child': 'inside' } },
        'text-as-jsx-child': 'outside',
      },
    },
  },
];

describe('testing parser', () => {
  let parser: Parser;

  beforeEach(() => {
    parser = new Parser();
  });
  describe('testing cleanComponent method', () => {
    it('should correctly clean a simple functional component', async () => {
      const simpleComponent = parser.cleanComponent(TestComponent2);
      expect(simpleComponent).toEqual(cleanComp2TestResult);
    });
    it('should correctly clean a conditional rendering functional component', async () => {
      const results = parser.cleanComponent(TestApp);
      expect(results).toEqual(cleanTestAppTestResult);
    });
    it('should correctly clean a functional component with text outside of immediate jsx', async () => {
      const textOutsideJsxComponent =
        parser.cleanComponent(SimpleTextOutsideJsx);
      expect(textOutsideJsxComponent).toEqual(testCleanSimpleTextOutsideJsx);
    });
  });
  describe('testing parseComponent method', () => {
    it('should correctly parse a simple functional component', async () => {
      const simpleComponent = await parser.parseComponent(TestComponent2);
      expect(simpleComponent).toEqual(testParseComp2TestResult);
    });
    it('should correctly parse a conditional rendering functional component', async () => {
      const results = await parser.parseComponent(TestApp);
      console.log('results', JSON.stringify(results, undefined, 2));
      expect(results).toEqual(testParseAppTestResult);
    });
    it('should correctly parse a functional component with text outside of immediate jsx', async () => {
      const textOutsideJsxComponent = await parser.parseComponent(
        SimpleTextOutsideJsx
      );
      expect(textOutsideJsxComponent).toEqual(testParseSimpleTextOutsideJsx);
    });
  });
});
