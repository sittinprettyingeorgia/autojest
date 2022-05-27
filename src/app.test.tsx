import AutoJestFactory from './auto-jest';
import App from './app';
import { Parser } from './parser';
describe('testing autojest', () => {
  it('should generate a component obj', async () => {
    const parser = new Parser();
    const parseResults = await parser.parseComponent(App);
    // eslint-disable-next-line no-magic-numbers
    console.log('results: ', JSON.stringify(parseResults, undefined, 2));
    const autojest = AutoJestFactory.autoJest();
    expect(autojest).not.toBeNull();
  });
});
