import React, { useState } from 'react';

const App = () => {
  const [state1, setState1] = useState(false);
  const [state2, setState2] = useState(false);

  const handleClick1 = () => {
    setState1(!state1);
  };

  const handleClick2 = () => {
    setState2(!state2);
  };

  if (state1) {
    return (
      <div
        onClick={handleClick1}
        onChange={handleClick1}
        onMouseEnter={handleClick1}
      >
        <div onClick={handleClick1} data-testid="div1">
          <p onClick={handleClick1}>This is div1 paragraph</p>
        </div>
        <div data-testid="div2">
          <p>
            This is div2 paragraph.<span>This is a span1</span>
          </p>
          <button onClick={handleClick1}>change state1</button>
        </div>
      </div>
    );
  } else {
    return (
      <React.Fragment>
        <div data-testid="div3">
          <p>
            This is a paragraph3.<span>This is a span3</span>
          </p>
          <button onClick={handleClick2}>change state 3</button>
        </div>
      </React.Fragment>
    );
  }
};

export default App;
