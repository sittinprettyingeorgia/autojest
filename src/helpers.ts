import App from './app';
interface BracketString {
  [key: string]: string;
}
const ZERO = 0;
const ONE = 1;
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
  //delete our comma key since we are currently inside of brackets.
  delete DONT_KEEP[','];
  let count = 1;
  let propagate = false;
  str = str ? str.replace('children:', '') + count : 'children';
  const [newChild, lastIndexOfJsx] = await recursiveFunction(
    ++start,
    '',
    jsx,
    {}
  );
  //while our current key is present we will increment the count and see if the new key is found.
  //EX. div1 in children then create div2 and check if in children
  if (str in children) {
    ++count;
    str = str.replaceAll(/\d+/g, '').concat(count.toString());
  }

  children[str] =
    typeof newChild === 'string' ? newChild : { ...(newChild as ChildList) };

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
  //add our comma back since we are currently outside of brackets.
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
      newChildren[key] = val;
    }
    children = { ...newChildren };
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
    } else if (char !== '{' && char !== '}') {
      str += char;
    }

    if (char === '{') {
      const [newChildren, lastIndexOfJsx, propagate] =
        await handleOpeningBracket(i, str, jsx, children, getChildren);

      if (propagate) {
        return [newChildren, lastIndexOfJsx];
      }

      str = '';
      i = lastIndexOfJsx;
    } else if (char === '}') {
      return handleClosingBracket(i, str, jsx, children, getChildren);
    }
  }

  return [children, NEG_ONE];
};

export const getJson = async (jsx: string) => {
  const [mainChild, _] = await getChildren(ZERO, '', jsx, {}); //retrieve the main child and the rest of the jsx string
  return mainChild;
};
