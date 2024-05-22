import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, Textarea, Text, VStack, Heading, Container, Spinner, Collapse } from '@chakra-ui/react';
import DonateButton from './DonateButton';

const apiUrl = process.env.REACT_APP_API_URL;

function App() {
  const [data, setData] = useState({
    scenario: '',
    question_1: '',
    question_2: '',
    question_3: ''
  });
  const [answers, setAnswers] = useState({
    answer_1: '',
    answer_2: '',
    answer_3: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [results, setResults] = useState({
    score_1: null,
    score_2: null,
    score_3: null
  });
  const [showAbout, setShowAbout] = useState(false);

  const fetchQuestions = () => {
    setIsLoading(true);
    axios.get(`${apiUrl}/generate_question`)
    .then(response => {
      setData(response.data);
      setIsLoading(false);
    })
    .catch(error => {
      console.error('Error:', error);
      setIsLoading(false);
    });
};

const submitAnswers = () => {
  setIsLoading(true);
  setIsScoring(true);

  const payload = {
    scenario: data.scenario,
    question_1: data.question_1,
    question_2: data.question_2,
    question_3: data.question_3,
    answer_1: answers.answer_1,
    answer_2: answers.answer_2,
    answer_3: answers.answer_3
  };

  axios.post(`${apiUrl}/score_answer`, payload, {
    headers: {'Content-Type': 'application/json'}
  })
  .then(response => {
    setResults({
      score_1: response.data.score_1,
      score_2: response.data.score_2,
      score_3: response.data.score_3
    });
    setIsLoading(false);
    setIsScoring(false);
  })
  .catch(error => {
    console.error('Error:', error);
    setIsLoading(false);
    setIsScoring(false);
  });
};

const handleAnswerChange = (e, field) => {
  setAnswers(prev => ({ ...prev, [field]: e.target.value }));
};

const calculateTotalScore = () => (
  (parseInt(results.score_1?.[0] || 0, 10) +
  parseInt(results.score_2?.[0] || 0, 10) +
  parseInt(results.score_3?.[0] || 0, 10))
);

return (
  <Container maxW="container.md" centerContent p={5}>
    <DonateButton />
    <Heading mb={4} textAlign="center">Practice Casper aka How to Get Away Being a Sociopath</Heading>
    <Button mt={4} mb={4} colorScheme="purple" onClick={() => setShowAbout(!showAbout)}>
      {showAbout ? 'Hide Info' : 'How does this work?'}
    </Button>
    <Collapse in={showAbout}>
      <Text mt={4}>
        The CASPer test is a written exam used primarily for medical school admissions, designed to assess key personal and ethical attributes. This app uses AI to generate practice questions based on previous CASPer exams to help users prepare. Answers are graded by the AI to provide feedback on how well the responses align with expected answers.
      </Text>
    </Collapse>
    <Button colorScheme="blue" onClick={fetchQuestions} isLoading={isLoading}>Generate Questions</Button>
    {isLoading && <Spinner />}
    {!isLoading && isScoring && <Spinner />}
    {!isLoading && isScoring && <Text>Scoring your answers, please wait...</Text>}
    {!isLoading && data.scenario && (
      <VStack spacing={4} align="stretch" mt={5}>
        <Text fontSize="xl"><strong>Scenario:</strong> {data.scenario}</Text>
        {[1, 2, 3].map(i => (
          <Box key={i}>
            <Text fontSize="lg"><strong>Question {i}:</strong> {data[`question_${i}`]}</Text>
            <Textarea
              placeholder={`Answer ${i}`}
              value={answers[`answer_${i}`]}
              onChange={(e) => handleAnswerChange(e, `answer_${i}`)}
              disabled={isLoading}
            />
            {results[`score_${i}`] && (
              <Text mt={2} color="red">
                <strong>Score:</strong> {results[`score_${i}`][0]}/9<br/>
                <strong>Feedback:</strong> {results[`score_${i}`][1]}
              </Text>
            )}
          </Box>
        ))}
        <Button colorScheme="teal" onClick={submitAnswers} disabled={isLoading || isScoring}>
          {isLoading ? <Spinner size="sm" /> : 'Submit Answers'}
        </Button>
        {results.score_1 && results.score_2 && results.score_3 && (
          <Text mt={4}><strong>Total Score:</strong> {calculateTotalScore()}/27</Text>
        )}
      </VStack>
    )}
  </Container>
);
}

export default App;
