import AutoJestFactory from './auto-jest';
import App from './app';
import { getJson } from './helpers';
const ZERO = 0;
describe('testing autojest', () => {
  it('should generate a component obj', async () => {
    const initialSplitRegex =
      /(return \(\(0, jsx_runtime_1\.jsxs\)\()|(return \(\(0, jsx_runtime_1\.jsx\)\()/gi;
    const jsxRegex =
      /(\n)|(\(0, jsx_runtime_1\.jsxs\)\()|(\(0, jsx_runtime_1\.jsx\)\()/gi;
    const initialSlice = 'return ((0, jsx_runtime_1.';
    const assignRegex = /, __assign/gi;
    const appString = App.toString();
    const mainChild = appString
      .slice(appString.indexOf(initialSlice))
      .split(initialSplitRegex)
      .filter(Boolean)
      .filter((item) => !item.startsWith(initialSlice));
    let jsxList = mainChild.map((jsx) =>
      jsx
        .replaceAll(jsxRegex, '')
        .replaceAll(assignRegex, '')
        .slice(ZERO, jsx.indexOf(';'))
    );
    jsxList = jsxList.map((jsx) => jsx.slice(ZERO, jsx.indexOf(';')));
    console.log('jsxList', await getJson(jsxList[ZERO]));
    // eslint-disable-next-line no-magic-numbers
    //console.log('json', await getJson(jsxList[0]));
    /*for (const jsx of jsxList) {
      await getJson(jsx);
    }*/
    const autojest = AutoJestFactory.autoJest();
    expect(autojest).not.toBeNull();
  });
});
