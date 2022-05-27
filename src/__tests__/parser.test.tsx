/* eslint-disable no-magic-numbers */
import {
  Parser,
  handleClosingBracket,
  handleOpeningBracket,
  cleanComponentString,
  getChildren,
  getJson,
} from '../parser';

const ZERO = 0;
const appTransform1 = {
  div1: {
    onClick: 'handleClick1',
    onChange: 'handleClick1',
    onMouseEnter: 'handleClick1',
    children: { div1: [Object], div2: [Object] },
  },
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
describe('testing parser', () => {
  let parser: Parser;

  beforeEach(() => {
    parser = new Parser();
  });
  describe('testing cleanComponent method', () => {
    it('should correctly clean a component', async () => {
      const cleanComp = cleanComponentString(TestComponent2);
      expect(cleanComp).toEqual(
        '("div", __assign({ "data-testid": "div1" }, { children: [(0, jsx_runtime_1.jsx)("p", { children: "We have a paragraph1." }), (0, jsx_runtime_1.jsx)("span", { children: "1" }), (0, jsx_runtime_1.jsx)("span", { children: "2" }), (0, jsx_runtime_1.jsx)("span", { children: "3" })] })))'
      );
      const results = await Promise.all(
        cleanComp.map(async (component) => getJson(component))
      );
      expect(results).toEqual(
        '("div", __assign({ "data-testid": "div1" }, { children: [(0, jsx_runtime_1.jsx)("p", { children: "We have a paragraph1." }), (0, jsx_runtime_1.jsx)("span", { children: "1" }), (0, jsx_runtime_1.jsx)("span", { children: "2" }), (0, jsx_runtime_1.jsx)("span", { children: "3" })] })))'
      );
    });
  });

  describe('testing parseComponent function', () => {
    it('should generate a component obj', async () => {
      const parseResults1 = await parser.parseComponent(TestComponent1);
      console.log(
        'Expected TestComponent1',
        JSON.stringify(TestComponent1.toString())
      );
      console.log('Actual TestComponent1:', JSON.stringify(parseResults1));
      expect(parseResults1.length).toBe(1);
      const parseResults2 = await parser.parseComponent(TestComponent2);
      console.log(
        'Expected TestComponent1',
        JSON.stringify(TestComponent1.toString())
      );
      console.log('Actual TestComponent2:', JSON.stringify(parseResults2));

      const mainDiv = parseResults1[0].div1;
      expect('data-testid' in mainDiv).toBe(true);
    });
  });
});
