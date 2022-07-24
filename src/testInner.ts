import { DONT_KEEP_REGEX, UNWANTED_OPENING_BRACKET_CHARS } from 'constant';
import { Elem, TestObject } from 'types';

const testObject: TestObject = { name: 'test' };
let pastFirst = false;
let commaFlag = false;
const possibleTextChild = false;

/**
 *
 * @returns Elem the parent element of our current element or a new Elem object.
 */
export const getParent = (elemStack: Elem[]): Elem => {
  let parentElem: Elem = {};

  if (elemStack.length > 0) {
    parentElem = elemStack.pop();
    if (parentElem === null || parentElem === undefined) {
      parentElem = {} as Elem;
    }
  }

  return parentElem;
};

/**
 *
 * @param str : string, characters collected up until this point.
 * @param currentAttr : Elem, our first Elem.
 * @returns Array [string, Elem] : a new string and a named Elem.
 */
export const handleFirstOpeningBracket = (
  str: string,
  currentAttr: Elem
): [str: string, newAttr: Elem] => {
  //we need to assign current str as the name of our first Elem
  currentAttr.elemName = str.trim().replaceAll(DONT_KEEP_REGEX, '');
  str = '';
  pastFirst = true; //are we past the mainChild?
  commaFlag = true; //are we within an elements Elems or not.

  return [str, currentAttr];
};

/**
 * Pushes current Elem on to the stack and returns a new named Elem.
 *
 * @param str : string, characters collected up until this point.
 * @param currentAttr : Elem, our current Elem.
 * @returns Array [string, Elem] :
 */
export const handleOpeningBracket = (
  str: string,
  currentAttr: Elem,
  elemStack: Elem[]
): [str: string, newAttr: Elem] => {
  if (!str) return ['', currentAttr];

  str = str.replace(UNWANTED_OPENING_BRACKET_CHARS, '');
  str = str.replace(DONT_KEEP_REGEX, '').trim();

  //we need to push our parent attr on the stack and assign a new currentAttr
  if (currentAttr) {
    elemStack.push(currentAttr);
  }

  const newAttr: Elem = { elemName: str };
  commaFlag = true; //figure out a way without the flag.

  return ['', newAttr];
};

/**
 * Splits an Elements Elems into key,val array.
 * @param str the string to be split
 * @returns An array [key:string,val:string]
 */
export const handleKeyVal = (str: string): [key: string, val: string] => {
  let [key, val] = str.split(':');
  key = key.replaceAll(DONT_KEEP_REGEX, '').trim();
  val = val ? val.replaceAll(DONT_KEEP_REGEX, '').trim() : val;

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

/**
 * Assigns an Elem to the appropriate element.
 * @param str the Elem string to be applied to the element
 * @param currentAttr the element to have Elems assigned
 * @returns an empty string and the current element
 */
export const handleElem = (
  str: string,
  currentAttr: Elem
): [str: string, newAttr: Elem] => {
  const [key, val] = handleKeyVal(str);
  if (key && val) currentAttr[key as keyof Elem] = val;

  return ['', currentAttr];
};

export const handleElems = (
  currentAttr: Elem,
  str: string,
  elemStack: Elem[]
): void => {
  const parentElem = getParent(elemStack);
  const [key, val] = handleKeyVal(str);

  if (key && val) currentAttr[key as keyof Elem] = val;

  if (
    currentAttr != null &&
    !(testObject.elems as Elem[]).includes(currentAttr)
  )
    (testObject.elems as Elem[]).push(currentAttr);

  commaFlag = false;

  if (
    elemStack.length < 1 &&
    parentElem !== null &&
    !(testObject.elems as Elem[]).includes(parentElem)
  ) {
    (testObject.elems as Elem[]).push(parentElem);
  }
};
/*
export const handleClosingBracket = (
  str: string,
  currentAttr: Elem
): [str: string, newAttr: Elem] => {
  //we need to close up currentAttr and retrieve last elem from stack in case Elems are placed at end of elem
  const parentElem = getParent();
  handleElems(currentAttr, str);

  return ['', parentElem];
};

export const handlePossibleTextChildAtStart = (
  str: string,
  currentAttr: Elem
): [str: string, newAttr: Elem] => {
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
  currentAttr: Elem,
  currentIndex?: number,
  jsx?: string
): [str: string, newAttr: Elem] => {
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
    return handleElem(str, currentAttr);
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
