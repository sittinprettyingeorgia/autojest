import {
  AutoJestI,
  ChildList,
  ParserI,
  FormatterI,
  FileWriterI,
} from './types';
import React from 'react';
import Parser from './parser';
/**
 * The AutoJestFactory class is a singleton
 * that handles returning an autoJest singleton instance.
 *
 */
class AutoJestFactory {
  static autoJest: () => AutoJestI;

  static staticConstructor = (() => {
    /**
     * The AutoJest class handles all aspects of jest test suite automation.
     */
    class AutoJest implements AutoJestI {
      parseComponent: (component: () => JSX.Element) => ChildList;

      // eslint-disable-next-line no-empty-function
      constructor() {
        this.parseComponent = (component: () => JSX.Element) => {
          const parser = new Parser();
          return parser.parseComponent(component);
        };
      }
    }

    let autoJest: AutoJestI;

    AutoJestFactory.autoJest = (): AutoJestI => {
      if (!autoJest) {
        return new AutoJest();
      } else {
        return autoJest;
      }
    };
  })();
}

export default AutoJestFactory;
