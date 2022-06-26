import {
  TestObject,
  FormatterI,
  TextChildren,
  Attribute,
  Flag,
  TextValue,
} from './types';

class Formatter implements FormatterI {
  formatTestObject: (testObj: TestObject) => string;
  eventMocks: Flag;

  constructor() {
    this.eventMocks = {};

    const getRenderingStart = (name: string): string => {
      return (
        `describe('testing ${name} component', () => {\n` +
        `\tit('should render all visible elements', async () => {\n` +
        `\t\trender(<${name} />);\n`
      );
    };

    const getRenderingEnd = (): string => {
      return `\t});`;
    };

    const getRenderingTests = (testObject: TestObject): string => {
      let renderingTests = '';
      for (const [key, val] of Object.entries(testObject)) {
        if (key === 'name' || key === 'elems') {
          continue;
        }

        for (const textChild of val as TextChildren[]) {
          if (textChild.multiple) {
            renderingTests += `\t\tfor(const item of await screen.findAllBy${key}('${textChild.value}')) {\n\t\t\texpect(item).toBeInTheDocument();\n\t\t}\n`;
          } else {
            renderingTests += `\t\texpect(await screen.findBy${key}('${textChild.value}')).toBeInTheDocument();\n`;
          }
        }
      }

      return renderingTests;
    };

    /*should get start after processing tests and storing necessary mocked items in map*/
    /*const getEventTest = (
      elem: Attribute,
      parent: TestObject,
      event: string,
      multiple?: boolean
    ) => {
      const { elemName, children, 'data-testid': dataId } = elem;
      const { PlaceholderText, AltText, Text } = parent;
      let queryText;
      let id;

      if (children) {
        queryText = children;
      } else if (dataId) {
        queryText = dataId;
        id = 'TestId';
      } else {
        throw new Error(
          `An ${elemName} event does not have an identifier` +
            'please add a data-testid or text item to the element.'
        );
      }

      const query = multiple ? `findAllBy${id}` : `findBy${id}`;

      const str =
        `\tit('should respond to an ${event} event on a ${elemName} component', async () => {\n` +
        `\t\trender(<${parent} />);\n` +
        `\t\tlet ${elemName} = await screen.${query}`;
    };

    const getEventTests = (testObject: TestObject): void => {
      const { elems, name, multiple } = testObject;
      for (const elem of elems as Attribute[]) {
        for (const eventName of Object.keys(elem)) {
          if (eventName.search('on') >= 0) {
            const eventTest = getEventTest(
              elem,
              testObject,
              eventName,
              eventName in (multiple as TextValue)
            );
          }
        }

        //we need to test for onClick, dblClick, onKeypress, and active etc.
        if ('onClick' in elem) {
          //currentEvent = 'onClick';
          //this.eventMocks[currentEvent] = 'mockOnClick';
        }
      }
    };*/

    this.formatTestObject = (testObj: TestObject): string => {
      return (
        getRenderingStart(testObj.name as unknown as string) +
        getRenderingTests(testObj) +
        getRenderingEnd()
      );
    };
  }
}

export default Formatter;
