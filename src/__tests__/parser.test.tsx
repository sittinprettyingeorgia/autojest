/* eslint-disable no-magic-numbers */
import Parser from '../Parser';
import { Fragment, useState } from 'react';

export const TestApp = () => {
  const [state1, setState1] = useState(true);
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
        data-testid="divP"
      >
        <input type="text" placeholder="test placeholder1" />
        <div onClick={handleClick1} data-testid="div1">
          <p onClick={handleClick1}>This is div1 paragraph</p>
          <img alt="img1"></img>
        </div>
        <img alt="img2"></img>
        <img alt="img2"></img>
        <div data-testid="div2">
          <input type="text" placeholder="test placeholder2" />
          <p>
            This is div2 paragraph.<span>This is a span1</span>
          </p>
          <label>
            test1
            <input />
          </label>
          <label>
            test2
            <textarea></textarea>
          </label>
          <img alt="img3"></img>
          <button onClick={handleClick1}>change state1</button>outsideButton
        </div>
        <input type="text" placeholder="test placeholder2" />
      </div>
    );
  } else {
    return (
      <Fragment>
        <div data-testid="div3">
          <input type="text" placeholder="test placeholder3" />
          <p>
            <img alt="img4"></img>
            <img alt="img4"></img>
            <input type="text" placeholder="test placeholder4" />
            This is a paragraph3.<span>This is a span3</span>Outside span
          </p>
          outsideP
          <img alt="img5"></img>
          <label>
            Username
            <input />
          </label>
          <label>
            Username
            <textarea></textarea>
          </label>
          <input type="text" placeholder="test placeholder5" />
          <button onClick={handleClick2}>change state 3</button>outsideButton
          <img alt="img6"></img>
          <input type="text" placeholder="test placeholder4" />
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

const SimpleWithPlaceholderText = () => {
  const handleClick1 = () => {
    return;
  };

  return (
    <div onClick={handleClick1}>
      <p>inside</p>outside
      <input type="text" placeholder="test placeholder" />
    </div>
  );
};

const cleanComp2TestResult = [
  {
    div: {
      children: [
        'p',
        { children: 'We have a paragraph1.' },
        'span',
        { children: '1' },
        'span',
        { children: '2' },
        'span',
        { children: '3' },
      ],
      'data-testid': 'div1',
    },
  },
];

const cleanTestAppTestResult = [
  '{"div": { onClick: handleClick1, onChange: handleClick1, onMouseEnter: handleClick1, "children": ["div", { onClick: handleClick1, "data-testid": "div1", "children": "p", { onClick: handleClick1, "children": "This is div1 paragraph" }) }), "div", { "data-testid": "div2", "children": ["p", { "children": ["This is div2 paragraph.", "span", { "children": "This is a span1" })] }), "button", { onClick: handleClick1, "children": "change state1" })] })] }))}' +
    '{react_1.Fragment: { "children": "div", { "data-testid": "div3", "children": ["p", { "children": ["This is a paragraph3.", "span", { "children": "This is a span3" })] }), "button", { onClick: handleClick2, "children": "change state 3" })] }) }))}',
];

const cleanTestWelcomeTest = [
  '"div", { children: ["div", { children: ["p", { children: "welcome" }), "paragraph", "div", { children: ["span", { children: "welcome span" }), "outside text"] })] }), "h1", { children: ["Hello, ", props.name] })] }))',
];

const testCleanSimpleTextOutsideJsx = [
  {
    div: {
      children: [
        'p',
        {
          children: 'inside',
        },
        'outside',
      ],
    },
  },
];

const testCleanSimpleWithPlaceholderText = [
  {
    div: {
      children: [
        'p',
        {
          children: 'inside',
        },
        'outside',
        'input',
        {
          type: 'text',
          placeholder: 'test placeholder',
        },
      ],
      onClick: 'handleClick1',
    },
  },
];

describe('testing parser', () => {
  let parser: Parser;

  beforeEach(() => {
    parser = new Parser();
  });
  describe('testing cleanComponent method', () => {
    it.skip('should correctly clean a simple functional component', async () => {
      const results = await parser.parseComponent(TestApp);
      expect(results).toEqual(cleanComp2TestResult);
    });
  });
});
