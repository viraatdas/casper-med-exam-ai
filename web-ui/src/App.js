import React from 'react';
import GenerateQuestion from './GenerateQuestion';
import ScoreAnswer from './ScoreAnswer';

function App() {
  return (
    <div className="App">
      <h1>Practice Casper!</h1>
      <GenerateQuestion />
      <ScoreAnswer />
    </div>
  );
}

export default App;

