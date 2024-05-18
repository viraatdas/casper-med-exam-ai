import React, { useState } from 'react';
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL;

function ScoreAnswer() {
  const [scenario, setScenario] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState('');

  const submitAnswer = () => {
    axios.post(`${apiUrl}/score_answer`, {
      scenario,
      question,
      answer
    })
    .then(response => {
      setResult(JSON.stringify(response.data, null, 2));
    })
    .catch(error => console.error('Error:', error));
  };

  return (
    <div>
      <h2>Score Answer</h2>
      <textarea value={scenario} onChange={e => setScenario(e.target.value)} placeholder="Scenario" />
      <textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="Question" />
      <textarea value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Answer" />
      <button onClick={submitAnswer}>Submit</button>
      <pre>{result}</pre>
    </div>
  );
}

export default ScoreAnswer;

