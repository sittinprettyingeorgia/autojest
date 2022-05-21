import { AutoJestI, ParserI, FormatterI, FileWriterI } from './types';
changessssss;
/**
 * The AutoJest class is a singleton that handles all aspects of automating jest
 * test suites.
 *
 */
class AutoJestFactory {
  static autoJest: () => AutoJestI;

  static staticConstructor = (() => {
    class AutoJest implements AutoJestI {
      parser: ParserI;

      constructor() {
        this.parser = 'wanda';
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
