import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, Textarea, Text, VStack, Heading, Container, Spinner } from '@chakra-ui/react';

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
  const [results, setResults] = useState({
    score_1: null,
    score_2: null,
    score_3: null
  });

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

    const payload = {
      scenario: data.scenario,
      question_1: data.question_1,
      question_2: data.question_2,
      question_3: data.question_3,
      answer_1: answers.answer_1,
      answer_2: answers.answer_2,
      answer_3: answers.answer_3
    };

    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    console.log(payload);

    axios.post(`${apiUrl}/score_answer`, payload, config)
      .then(response => {
        setResults({
          score_1: response.data.score_1,
          score_2: response.data.score_2,
          score_3: response.data.score_3
        });
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setIsLoading(false);
      });
  };

  const handleAnswerChange = (e, field) => {
    setAnswers(prev => ({ ...prev, [field]: e.target.value }));
  };

  const calculateTotalScore = () => {
    return (
      (parseInt(results.score_1?.[0] || 0, 10) +
      parseInt(results.score_2?.[0] || 0, 10) +
      parseInt(results.score_3?.[0] || 0, 10))
    );
  };

  return (
    <Container maxW="container.md" centerContent p={5}>
      <Heading mb={4} textAlign="center">Practice Casper aka How to Get Away Being a Sociopath</Heading>
      <Button colorScheme="blue" onClick={fetchQuestions} isLoading={isLoading}>Generate Questions</Button>
      {isLoading && <Spinner />}
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
          <Button colorScheme="teal" onClick={submitAnswers} disabled={isLoading}>
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
