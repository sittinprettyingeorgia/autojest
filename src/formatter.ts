import { TestObject, FormatterI, TextChildren } from './types';

class Formatter implements FormatterI {
  formatTestObject: (testObj: TestObject) => string;
  file: string;
  constructor() {
    const addStart = (name: string) => {
      this.file = '';
      this.file +=
        `describe('testing ${name} component', () => {\n` +
        `\tit('should render all visible elements', async () => {\n`;
    };

    const addEnd = () => {
      this.file += `\t};\n};`;
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
              `\t\tconst items = expect(await screen.findAllBy${name}('${textChild.value}'));\n` +
              `\t\tfor(const item of items) {\n\t\t\texpect(item).toBeInTheDocument();\n\t\t}\n`;
          } else {
            this.file += `\t\texpect(await screen.findBy${name}('${textChild.value}')).toBeInTheDocument();\n`;
          }
        }
      }
    };

    this.formatTestObject = (testObj: TestObject): string => {
      addStart(testObj.name as unknown as string);
      addRenderingTests(testObj);
      addEnd();
      const results = this.file;
      this.file = '';
      console.log(results);
      return results;
    };
  }
}

export default Formatter;
