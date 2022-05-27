import App from './app';
interface BracketString {
  [key: string]: string;
}
const ZERO = 0;
const NEG_ONE = -1;
const DONT_KEEP: BracketString = {
  '(': '(',
  ')': ')',
  '"': '"',
  '[': '[',
  ']': ']',
  ' ': ' ',
  "'": "'",
  ',': ',',
};
const OPEN_BRACKETS: BracketString = {
  '{': '{',
};
const CLOSE_BRACKETS: BracketString = {
  '}': '}',
};
let textValueIsJsxChild = false;
const stack: string[] = [];
interface ChildList {
  [key: string]: any;
}

const handleOpeningBracket = async (
  start: number,
  str: string,
  jsx: string,
  children: ChildList,
  recursiveFunction: (
    startIndex: number,
    recStr: string,
    recJsx: string,
    recChildren: ChildList
  ) => Promise<any>
) => {
  //delete our comma key from dont keep since we are currently inside of brackets
  //we want to keep commas in our str string
  delete DONT_KEEP[','];

  let count = 1;
  let propagate = false;

  const [newChild, lastIndexOfJsx] = await recursiveFunction(
    ++start,
    '',
    jsx,
    {}
  );

  if (str.includes('children:') && str.includes(',')) {
    const [singleTextChild, nextElem] = str
      .split(',')
      .filter((item) => Boolean(item));

    if (nextElem) {
      textValueIsJsxChild = true;
      const [_, textValue] = singleTextChild
        .split(':')
        .filter((item) => Boolean(item));
      children['text-as-jsx-child'] = textValue;
      str = nextElem;
    }
  }

  // chop the children: if we are working with jsx elements
  // otherwise assign children because it is likely a text value.
  str = str ? str.replace('children:', '') + count : 'children';
  str = str.replaceAll(',', '');
  //while our current key is present we will increment the count and see if the new key is found.
  //EX. div1 in children then create div2 and check if in children
  if (str in children) {
    ++count;
    str = str.replaceAll(/\d+/g, '').concat(count.toString());
  }

  if (typeof newChild === 'string') {
    children['text-as-jsx-child'] = newChild;
  } else {
    children[str] = { ...(newChild as ChildList) };
  }

  if (typeof newChild === 'string' || str === 'children') {
    propagate = true;
  }

  return [{ ...children }, lastIndexOfJsx, propagate];
};

const handleClosingBracket = async (
  start: number,
  str: string,
  jsx: string,
  children: ChildList,
  recursiveFunction: (
    startIndex: number,
    recStr: string,
    recJsx: string,
    recChildren: ChildList
  ) => Promise<any>
) => {
  //add our comma back since we are currently outside of brackets
  //we do not want a comma in our str.
  DONT_KEEP[','] = ',';

  if (!str) {
    return [{ ...children }, ++start];
  } else if (str.includes('children:')) {
    str = str.replace('children:', '');

    return [str, ++start];
  } else if (str.includes(':')) {
    const newChildren: ChildList = {};
    const tempSplit = str.split(',');

    for (const child of tempSplit) {
      const [key, val] = child.split(':');
      children[key] = val;
    }
  }

  const [newChild, lastIndexOfJsx] = await recursiveFunction(
    ++start,
    '',
    jsx,
    children
  );

  return [newChild, lastIndexOfJsx];
};

const getChildren = async (
  start: number,
  str: string,
  jsx: string,
  children: ChildList
): Promise<any> => {
  if (jsx.length <= ZERO || jsx.indexOf('{') < ZERO) {
    const lastChild: ChildList = {};
    const [key, val] = jsx.slice(ZERO, jsx.indexOf('}')).split(':');
    lastChild[key] = val;
    return [lastChild, jsx.indexOf('}')];
  }

  for (let i = start; i < jsx.length && i !== NEG_ONE; i++) {
    const char = jsx.charAt(i);
    if (char in DONT_KEEP) {
      continue;
    } else if (!(char in OPEN_BRACKETS) && !(char in CLOSE_BRACKETS)) {
      str += char;
    }

    if (char in OPEN_BRACKETS) {
      stack.push();
      const [newChildren, lastIndexOfJsx, propagate] =
        await handleOpeningBracket(i, str, jsx, children, getChildren);

      if (propagate) {
        return [newChildren, lastIndexOfJsx];
      }

      str = '';
      i = lastIndexOfJsx;
    } else if (char in CLOSE_BRACKETS) {
      //the stack will let us know if we are working with a jsx element or
      //if we have a text value
      stack.pop();
      if (textValueIsJsxChild) {
        DONT_KEEP[','] = ',';
        textValueIsJsxChild = false;
        continue;
      } else {
        return handleClosingBracket(i, str, jsx, children, getChildren);
      }
    }
  }

  return [children, NEG_ONE];
};

export const getJson = async (jsx: string) => {
  const [mainChild, _] = await getChildren(ZERO, '', jsx, {}); //retrieve the main child and the rest of the jsx string
  return mainChild;
};
