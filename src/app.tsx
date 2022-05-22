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

  return (
    <React.Fragment>
      <div data-testid="div1">
        <p>
          This is a paragraph.<span>This is a span</span>
        </p>
        <button onClick={handleClick1}>This is a button1</button>
        <button onClick={handleClick2}>This is a button2</button>
      </div>
      <div data-testid="div1"></div>
    </React.Fragment>
  );
};
export default App;
