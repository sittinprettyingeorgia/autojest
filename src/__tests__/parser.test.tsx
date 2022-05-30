/* eslint-disable no-magic-numbers */
import {
  Parser,
  handleClosingBracket,
  handleOpeningBracket,
  cleanComponentString as cleanComp1,
  getChildren,
  getJson,
} from '../parser';
import { RefactorParser } from '../refactorParser';
import App from '../app';

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
  let parser2: RefactorParser;

  beforeEach(() => {
    parser = new Parser();
    parser2 = new RefactorParser();
  });
  describe('testing cleanComponent method', () => {
    it('should correctly clean a component', async () => {
      const cleanStr = cleanComp1(App);
      console.log('clean1', cleanStr);
      //const parsed1 = await parser.parseComponent(App);
      const parsed2 = await parser2.parseComponent(App);
      //console.log(App.toString());
      //console.log('parsed1', JSON.stringify(parsed1, undefined, 2));
      console.log('parsed2', JSON.stringify(parsed2, undefined, 2));

      const results = await Promise.all(
        cleanStr.map(async (component) => getJson(component))
      );
      expect(results).toEqual(
        '("div", __assign({ "data-testid": "div1" }, { children: [(0, jsx_runtime_1.jsx)("p", { children: "We have a paragraph1." }), (0, jsx_runtime_1.jsx)("span", { children: "1" }), (0, jsx_runtime_1.jsx)("span", { children: "2" }), (0, jsx_runtime_1.jsx)("span", { children: "3" })] })))'
      );
    });
  });
});
