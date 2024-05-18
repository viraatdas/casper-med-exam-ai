import React, { useState } from 'react';
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL;

function ScoreAnswer() {
  const [scenario, setScenario] = useState('');
  const [questions, setQuestions] = useState({ question_1: '', question_2: '', question_3: '' });
  const [answers, setAnswers] = useState({ answer_1: '', answer_2: '', answer_3: '' });
  const [scores, setScores] = useState([]); // Array to store scores
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e, type) => {
    if (type.startsWith('question')) {
      setQuestions(prev => ({ ...prev, [type]: e.target.value }));
    } else if (type.startsWith('answer')) {
      setAnswers(prev => ({ ...prev, [type]: e.target.value }));
    }
  };

  const submitAnswer = () => {
    setIsLoading(true);
    axios.post(`${apiUrl}/score_answer`, {
      scenario,
      ...questions,
      ...answers
    })
    .then(response => {
      // Extract scores from response and update state
      const fetchedScores = [
        response.data.score_1,
        response.data.score_2,
        response.data.score_3
      ];
      setScores(fetchedScores);
      setIsLoading(false);
    })
    .catch(error => {
      console.error('Error:', error);
      setScores([]); // Clear scores on error
      setIsLoading(false);
    });
  };

  return (
    <div>
      <h2>Score Answer</h2>
      <textarea value={scenario} onChange={e => setScenario(e.target.value)} placeholder="Scenario" disabled={isLoading} />
      <textarea value={questions.question_1} onChange={e => handleInputChange(e, 'question_1')} placeholder="Question 1" disabled={isLoading} />
      <textarea value={questions.question_2} onChange={e => handleInputChange(e, 'question_2')} placeholder="Question 2" disabled={isLoading} />
      <textarea value={questions.question_3} onChange={e => handleInputChange(e, 'question_3')} placeholder="Question 3" disabled={isLoading} />
      <textarea value={answers.answer_1} onChange={e => handleInputChange(e, 'answer_1')} placeholder="Answer 1" disabled={isLoading} />
      <textarea value={answers.answer_2} onChange={e => handleInputChange(e, 'answer_2')} placeholder="Answer 2" disabled={isLoading} />
      <textarea value={answers.answer_3} onChange={e => handleInputChange(e, 'answer_3')} placeholder="Answer 3" disabled={isLoading} />
      <button onClick={submitAnswer} disabled={isLoading}>
        {isLoading ? 'Submitting...' : 'Submit'}
      </button>
      {scores.length > 0 && (
        <div>
          <h3>Scores</h3>
          {scores.map((score, index) => (
            <p key={index}>{score ? `Score ${index + 1}: ${score[0]} - ${score[1]}` : 'No score available'}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export default ScoreAnswer;
