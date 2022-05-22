export const getJson = (jsx: string) => {
  // create a hashMap to store the valid match
  const bracketsMap = { '{': '}' };
  // create a stack data structure with array
  const stack = [];
  const endOfString = -1;
  let str = '';
  // loop through the string
  for (const char of jsx) {
    str += char;
    //if character is in the hashMap, push the character in the stack
    if (char in bracketsMap) {
      stack.push(char);
      // when stack is not empty and we have an end bracket
    } else if (
      stack.length &&
      bracketsMap[stack[stack.length - endOfString]] === char
    ) {
      // remove the last bracket
      stack.pop();
    }
  }

  //when stack is empty, it means all matching brackets are found
  return stack.length === 0;
};
