# casper-med-exam-ai
Casper is an ethics exam to get into med school - this is a preparatory website that generates and grades your response

**Production link:** [foobar]()
## How does it work?

It uses an LLM (currently [Llama 3](https://llama.meta.com/llama3/)) to generate questions. 

We have told it what kind of questions and scoring parameters are used for the Caspr. 

## API Usage

1. Generate Question
**Endpoint: /generate_question**

Method: GET

Description: This endpoint generates a sample question based on predefined criteria and sends the request to the Ollama server for processing.

Example Usage: 
```bash
curl -X GET http://127.0.0.1:5000/generate_question
```

**Response:**

A JSON object containing a generated question scenario and related questions, or an error message if the generation fails.

2. Score Answer
**Endpoint: /score_answer**

Method: POST

Description: This endpoint accepts a JSON payload containing a scenario, a question, and an answer. It scores the provided answer based on its relevance and quality against set criteria.


```json
{
  "scenario": "Description of the scenario.",
  "question_1": "Related question to the scenario.",
  "question_2": "Related question to the scenario.",
  "question_3": "Related question to the scenario.",
  "answer_1": "User's answer to the question."
  "answer_2": "User's answer to the question."
  "answer_3": "User's answer to the question."
}
```

Example Usage:
```bash
curl -X POST http://127.0.0.1:5000/score_answer \
-H "Content-Type: application/json" \
-d '{
    "scenario": "Your company is launching a new software product...",
    "question": "How would you address the concerns about the user interface...",
    "answer": "First, I would initiate a series of user experience tests..."
}'
```

**Response:**

A JSON object containing the scores for the provided answers, including critiques for each score, or an error message if there is an issue with processing.






