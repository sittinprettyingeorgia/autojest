import React from 'react';
import { AutoJestI, ParserI, FormatterI, FileWriterI } from './types';

class Parser implements ParserI {
  parseComponent: (component: React.Component) => string;
}
