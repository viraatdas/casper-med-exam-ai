import React, { useState } from 'react';
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL;

function GenerateQuestion() {
  const [question, setQuestion] = useState('');

  const fetchQuestion = () => {
    axios.get(`${apiUrl}/generate_question`)
      .then(response => {
        setQuestion(JSON.stringify(response.data, null, 2));
      })
      .catch(error => console.error('Error:', error));
  };

  return (
    <div>
      <h2>Generate Question</h2>
      <button onClick={fetchQuestion}>Generate</button>
      <pre>{question}</pre>
    </div>
  );
}

export default GenerateQuestion;

