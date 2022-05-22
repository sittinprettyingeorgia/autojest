import AutoJestFactory from './auto-jest';
import App from './app';
import { screen, render } from '@testing-library/react';

describe('testing autojest', () => {
  it('should generate a component obj', () => {
    const initialSplitRegex =
      /(return \(0, jsx_runtime_1\.jsxs\)\()|(return \(0, jsx_runtime_1\.jsx\)\()/gi;
    const jsxRegex =
      /(\n)|(\(0, jsx_runtime_1\.jsxs\)\()|(\(0, jsx_runtime_1\.jsx\)\()/gi;

    const assignRegex = /, __assign\(/gi;
    const appString = App.toString();
    const jsg = appString.split(initialSplitRegex);
    console.log(jsg);
    /*const jsxs = appReturn
      .split('return (0, jsx_runtime_1.jsx)')
      .filter(Boolean)
      .map((jsx) =>
        jsx
          .slice(jsx.indexOf('{'))
          .replaceAll(jsxRegex, '')
          .replaceAll(assignRegex, ':')
      );

    for (const jsx of jsxs) {
      const str = JSON.stringify(jsx);
      console.log(JSON.parse(str));
    }*/
    const autojest = AutoJestFactory.autoJest();
    expect(autojest).not.toBeNull();
  });
});
