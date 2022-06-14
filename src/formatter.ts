import { TestObject, FormatterI, TextChildren } from './types';

class Formatter implements FormatterI {
  formatTestObject: (testObj: TestObject) => string;
  file: string;
  constructor() {
    const addStart = (name: string) => {
      this.file = '';
      return (
        `describe('testing ${name} component', () => {\n` +
        `\t it('should render all visible elements', () => {\n`
      );
    };

    const addRenderingTests = (testObject: TestObject) => {
      for (const [key, val] of Object.entries(testObject)) {
        if (key === 'name' || key === 'events') {
          continue;
        }
        const name = key.slice(key.indexOf('Text'), key.length);

        for (const textChild of val as TextChildren[]) {
          if (textChild.multiple) {
            this.file +=
              `const items = expect(await screen.findAllBy${name});\n` +
              `\t\t\t for(const item of items){\n\t\t\texpect(item).toBeInTheDocument();\n\t\t}`;
          } else {
            this.file += `expect(await screen.findBy${name}).toBeInTheDocument();\n`;
          }
        }
      }
    };

    this.formatTestObject = (): string => {
      const str = '';
      return '';
    };
  }
}

export default Formatter;
