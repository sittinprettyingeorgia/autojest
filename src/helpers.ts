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

const getChildren = async (
  start: number,
  str: string,
  jsx: string,
  children: ChildList
) => {
  if (jsx.length <= ZERO || jsx.indexOf('{') < ZERO) {
    const lastChild: ChildList = {};
    const [key, val] = jsx.slice(ZERO, jsx.indexOf('}')).split(':');
    lastChild[key] = val;
    return [lastChild, NEG_ONE];
  }

  for (let i = start; i < jsx.length; i++) {
    const char = jsx.charAt(i);
    if (char in DONT_KEEP) {
      continue;
    } else if (char !== '{' && char !== '}') {
      str += char;
    }

    if (char === '{' || char === '[') {
      //delete our comma key since we are currently inside of brackets.
      delete DONT_KEEP[','];
      console.log('currentSTr', str);

      const [newChild, lastIndexOfJsx] = await getChildren(++i, '', jsx, {});
      children[str ? str : 'children'] = { ...(newChild as ChildList) };

      str = '';
      if ((lastIndexOfJsx as number) === NEG_ONE) break;
      else {
        i = lastIndexOfJsx as number;
      }
    } else if (char === '}' || char === ']') {
      //add our comma back since we are currently outside of brackets.
      DONT_KEEP[','] = ',';

      if (str.includes(',')) {
        const newChildren: ChildList = {};
        const tempSplit = str.split(',');
        for (const child of tempSplit) {
          const [key, val] = child.split(':');
          newChildren[key] = val;
        }
        return [newChildren, ++i];
      }

      return [children, ++i];
    }
  }

  return [children, NEG_ONE];
};

export const getJson = async (jsx: string) => {
  const mainChild = await getChildren(ZERO, '', jsx, {}); //retrieve the main child and the rest of the jsx string
  console.log('mainChild', mainChild);
  return mainChild;
};
