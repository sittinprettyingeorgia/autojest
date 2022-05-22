import { AutoJestI, ParserI, FormatterI, FileWriterI } from './types';
import React from 'react';
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
      parseComponent: (component: React.Component) => string;

      constructor() {
        this.parseComponent = (_component: React.Component) => {
          return 'placeholder';
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
