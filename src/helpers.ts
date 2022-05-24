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
): Promise<any> => {
  if (jsx.length <= ZERO || jsx.indexOf('{') < ZERO) {
    const lastChild: ChildList = {};
    const [key, val] = jsx.slice(ZERO, jsx.indexOf('}')).split(':');
    lastChild[key] = val;
    return [lastChild, jsx.indexOf('}')];
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
      const newStr = str ? str.replace('children:', '') : 'children';

      const [newChild, lastIndexOfJsx] = await getChildren(++i, '', jsx, {});

      if (typeof newChild === 'string') {
        children[newStr] = newChild;
        return [children, lastIndexOfJsx];
      }

      children[newStr] = { ...(newChild as ChildList) };
      str = '';
      if ((lastIndexOfJsx as number) === NEG_ONE) break;
      else {
        i = lastIndexOfJsx as number;
      }
    } else if (char === '}' || char === ']') {
      //add our comma back since we are currently outside of brackets.
      DONT_KEEP[','] = ',';
      if (!str) {
        return [children, ++i];
      } else if (str.includes('children:')) {
        str = str.replace('children:', '');
        return [str, ++i];
      } else if (str.includes(':')) {
        const newChildren: ChildList = {};
        const tempSplit = str.split(',');
        for (const child of tempSplit) {
          const [key, val] = child.split(':');
          newChildren[key] = val;
        }
        children = newChildren;
      }

      const [newChild, lastIndexOfJsx] = await getChildren(
        ++i,
        '',
        jsx,
        children
      );

      return [newChild, lastIndexOfJsx];
    }
  }

  return [children, NEG_ONE];
};

export const getJson = async (jsx: string) => {
  const [mainChild, _] = await getChildren(ZERO, '', jsx, {}); //retrieve the main child and the rest of the jsx string
  return mainChild;
};
