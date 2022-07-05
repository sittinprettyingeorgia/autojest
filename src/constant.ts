export const INIT_SPLIT =
  /(return \(\(0, jsx_runtime_1\.jsxs\)\()|(return \(\(0, jsx_runtime_1\.jsx\)\()/gi;
export const JSX_REGEX =
  /(\n)|(\(0, jsx_runtime_1\.jsxs\)\()|(\(0, jsx_runtime_1\.jsx\)\()/gi;
export const INIT_SLICE = 'return ((0, jsx_runtime_1.';
export const ZERO = 0;
export const ONE = 1;
export const ON_CLICK_REGEX =
  /(")[}a-zA-Z0-9{_.",\s:-]+(")[:,]+(?=[}a-zA-Z0-9{_.",\s:-]*\bonClick\b)/gi;
export const ON_CHANGE_REGEX =
  /(")[}a-zA-Z0-9{_.",\s:-]+(")[:,]+(?=[}a-zA-Z0-9{_.",\s:-]*\bonChange\b)/gi;
export const ON_MOUSE_OVER_REGEX =
  /(")[}a-zA-Z0-9{_.",\s:-]+(")[:,]+(?=[}a-zA-Z0-9{_.",\s:-]*\bonMouseOver\b)/gi;
export const ON_MOUSE_DOWN_REGEX =
  /(")[}a-zA-Z0-9{_.",\s:-]+(")[:,]+(?=[}a-zA-Z0-9{_.",\s:-]*\bonMouseDown\b)/gi;
export const ON_MOUSE_OUT_REGEX =
  /(")[}a-zA-Z0-9{_.",\s:-]+(")[:,]+(?=[}a-zA-Z0-9{_.",\s:-]*\bonMouseOut\b)/gi;
export const ON_KEYDOWN_REGEX =
  /(")[}a-zA-Z0-9{_.",\s:-]+(")[:,]+(?=[}a-zA-Z0-9{_.",\s:-]*\bonKeyDown\b)/gi;
export const ON_KEYPRESS_REGEX =
  /(")[}a-zA-Z0-9{_.",\s:-]+(")[:,]+(?=[}a-zA-Z0-9{_.",\s:-]*\bonKeyPress\b)/gi;
export const ON_INPUT_REGEX =
  /(")[}a-zA-Z0-9{_.",\s:-]+(")[:,]+(?=[}a-zA-Z0-9{_.",\s:-]*\bonInput\b)/gi;
export const DATA_TEST_ID_REGEX =
  /(")[}a-zA-Z0-9{_.",\s:-]+(")[:,]+(?=[}a-zA-Z0-9{_.",\s:-]*\bdataTestId\b)/gi;
export const ROLE_REGEX =
  /(")[}a-zA-Z0-9{_.",\s:-]+(")[:,]+(?=[}a-zA-Z0-9{_.",\s:-]*\brole\b)/gi;
export const SINGLE_CHILD = '(0, jsx_runtime_1.jsx)("';
export const MULTIPLE_CHILD = '(0, jsx_runtime_1.jsxs)("';
export const SINGLE = 'jsx_runtime_1.jsx';
export const MULTI = 'jsx_runtime_1.jsxs';
export const CHILDREN_KEY = '/children: ';
export const DONT_KEEP_REGEX = /[",\]0)([':]+/gi;
export const MATCH_TEXT_CHILD = /("[a-zA-z0-9_\s-]+"(?=, \(0))/gi;
export const DONT_KEEP_MAP = {
  '{': '{',
  '}': '{',
  //'[': '[',
  //']': ']',
  ';': ';',
  '"': '"',
};
