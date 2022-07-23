import { DONT_KEEP_REGEX, UNWANTED_OPENING_BRACKET_CHARS } from 'constant';
import { Attribute, TestObject } from 'types';

const testObject: TestObject = { name: 'test' };
//const elemStack: Attribute[] = [];
let pastFirst = false;
let commaFlag = false;
const possibleTextChild = false;

/**
 *
 * @returns Attribute the parent element of our current element or a new Attribute object.
 */
/*const getParent = (): Attribute => {
  let parentElem: Attribute;

  if (elemStack.length > 0) {
    parentElem = elemStack.pop();
    if (parentElem === null || parentElem === undefined) {
      parentElem = {} as Attribute;
    }
  }

  return parentElem;
};*/

/**
 *
 * @param str : string, characters collected up until this point.
 * @param currentAttr : Attribute, our first Attribute.
 * @returns Array [string, Attribute] : a new string and a named Attribute.
 */
export const handleFirstOpeningBracket = (
  str: string,
  currentAttr: Attribute
): [str: string, newAttr: Attribute] => {
  //we need to assign current str as the name of our first attribute
  currentAttr.elemName = str.trim().replaceAll(DONT_KEEP_REGEX, '');
  str = '';
  pastFirst = true; //are we past the mainChild?
  commaFlag = true; //are we within an elements attributes or not.

  return [str, currentAttr];
};

/**
 * Pushes current Attribute on to the stack and returns a new named Attribute.
 *
 * @param str : string, characters collected up until this point.
 * @param currentAttr : Attribute, our current Attribute.
 * @returns Array [string, Attribute] :
 */
export const handleOpeningBracket = (
  str: string,
  currentAttr: Attribute,
  elemStack: Attribute[]
): [str: string, newAttr: Attribute] => {
  str = str.replace(UNWANTED_OPENING_BRACKET_CHARS, '');
  str = str.replace(DONT_KEEP_REGEX, '').trim();

  //we need to push our parent attr on the stack and assign a new currentAttr
  if (currentAttr) {
    elemStack.push(currentAttr);
  }

  const newAttr: Attribute = { elemName: str };
  commaFlag = true; //figure out a way without the flag.

  return ['', newAttr];
};

export const handleKeyVal = (str: string): [key: string, val: string] => {
  let [key, val] = str.split(':');
  key = key.trim().replaceAll(DONT_KEEP_REGEX, '');
  val = val ? val.trim().replaceAll(DONT_KEEP_REGEX, '') : val;

  const end = 'Text';
  if (key === 'placeholder' || key === 'alt') {
    return [
      (key.charAt(0) as string).toUpperCase() + key.substring(1) + end,
      val,
    ];
  } else if (key === 'children') {
    return [end, val];
  }

  return [key, val];
};
/*
export const handleAttribute = (
  str: string,
  currentAttr: Attribute
): [str: string, newAttr: Attribute] => {
  //we need to handle attribute assignment(onclick,data-testid, etc)
  str = str.replaceAll('"', '');
  let [key, val] = str.split(':');
  key = key.trim().replaceAll(DONT_KEEP_REGEX, '');
  val = val ? val.trim().replaceAll(DONT_KEEP_REGEX, '') : val;

  if (key && val) currentAttr[key.trim() as keyof Attribute] = val.trim();

  return ['', currentAttr];
};

export const handleElems = (currentAttr: Attribute, str: string): void => {
  const parentElem = getParent();
  const [key, val] = handleKeyVal(str);

  if (key && val) currentAttr[key as keyof Attribute] = val;

  if (
    currentAttr != null &&
    !(testObject.elems as Attribute[]).includes(currentAttr)
  )
    (testObject.elems as Attribute[]).push(currentAttr);

  commaFlag = false;

  if (
    elemStack.length < 1 &&
    parentElem !== null &&
    !(testObject.elems as Attribute[]).includes(parentElem)
  ) {
    (testObject.elems as Attribute[]).push(parentElem);
  }
};

export const handleClosingBracket = (
  str: string,
  currentAttr: Attribute
): [str: string, newAttr: Attribute] => {
  //we need to close up currentAttr and retrieve last elem from stack in case attributes are placed at end of elem
  const parentElem = getParent();
  handleElems(currentAttr, str);

  return ['', parentElem];
};

export const handlePossibleTextChildAtStart = (
  str: string,
  currentAttr: Attribute
): [str: string, newAttr: Attribute] => {
  const parentElem = getParent();

  if (!str.includes(SINGLE || MULTI)) {
    //console.log('handle text child start');
    handleElems(currentAttr, str);
  }

  possibleTextChild = false;
  return ['', parentElem];
};

export const handleChar = (
  char: string,
  str: string,
  currentAttr: Attribute,
  currentIndex?: number,
  jsx?: string
): [str: string, newAttr: Attribute] => {
  if (!(char in DONT_KEEP_MAP)) {
    str += char;
  }

  //REGEX match forward
  const isTextChild = jsx
    .substring(currentIndex - str.length + 1, currentIndex + str.length + 7)
    .search(MATCH_TEXT_CHILD);

  if (!str) {
    return ['', currentAttr];
  }

  if (char === ',') {
    //console.log('str', str);
    //console.log('currentAttr:', currentAttr && currentAttr.elemName);
  }

  if (char === '{' && !pastFirst) {
    return handleFirstOpeningBracket(str, currentAttr);
  } else if (char === '{') {
    return handleOpeningBracket(str, currentAttr);
  } else if (
    char === ',' &&
    currentAttr &&
    possibleTextChild &&
    isTextChild >= 0
  ) {
    //we need to handle possible text child here
    return handlePossibleTextChildAtStart(str, currentAttr);
  } else if (char === ',' && str.includes(':') && commaFlag) {
    return handleAttribute(str, currentAttr);
  } else if (char === '}') {
    return handleClosingBracket(str, currentAttr);
  } else if (char === '[') {
    possibleTextChild = true;
  } else if (char === ']') {
    //we should check if current string has text child.
  }

  return [str, currentAttr];
};
*/
