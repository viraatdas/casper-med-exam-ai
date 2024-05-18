import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, Textarea, Text, VStack, Input, Heading, Container, Spinner } from '@chakra-ui/react';

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
  const [results, setResults] = useState('');

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
    axios.post(`${apiUrl}/score_answer`, { ...data, ...answers })
      .then(response => {
        setResults(JSON.stringify(response.data, null, 2));
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
              <Text fontSize="lg">{data[`question_${i}`]}</Text>
              <Textarea
                placeholder={`Answer ${i}`}
                value={answers[`answer_${i}`]}
                onChange={(e) => handleAnswerChange(e, `answer_${i}`)}
              />
            </Box>
          ))}
          <Button colorScheme="teal" onClick={submitAnswers} disabled={isLoading}>Submit Answers</Button>
          {results && <Text mt={4}><strong>Results:</strong> {results}</Text>}
        </VStack>
      )}
    </Container>
  );
}

export default App;
