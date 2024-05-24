from flask import Flask, request, jsonify
from flask_cors import CORS
import ollama
import json
import logging
from logging.handlers import RotatingFileHandler
import re
import os


app = Flask(__name__)
CORS(app)

# Set up logging to a file
handler = RotatingFileHandler('app.log', maxBytes=10000, backupCount=1)
handler.setLevel(logging.INFO)
app.logger.addHandler(handler)

isDevMode = app.debug
isDevMode = False
print(f"Running in {'development' if isDevMode else 'production'} mode")

# Check if the application is in debug mode or not
if isDevMode:
    import ollama
    ollama_client = ollama.Client()
    def chat_api(prompt, model="llama3"):
        app.logger.info(f"Sending request to Ollama with model {model}")
        response = ollama_client.chat(model=model, messages=[{'role': 'system', 'content': prompt}])
        return response['message']['content']
else:
    import groq
    from groq import Groq
    groq_client = Groq(
            api_key=os.environ.get("GROQ_API_KEY"),
        )

    def chat_api(prompt, model="llama3-8b-8192"):
        app.logger.info(f"Sending request to Groq with model {model}")
        chat_completion = groq_client.chat.completions.create(
            messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
            model=model,
        )
        output = chat_completion.choices[0].message.content
        print(output)
        return output


def extract_json(output):
    # Modify the regex to match a broader range of JSON objects, including nested structures
    json_match = re.search(r'({.*})', output, re.DOTALL)
    if json_match:
        json_string = json_match.group(1)  # Group 1 to match the entire JSON object
        try:
            # Validate and parse the JSON to ensure it's correctly formatted
            json_data = json.loads(json_string)
            return json_data
        except json.JSONDecodeError as e:
            return {"error": "Failed to decode JSON: " + str(e)}
    else:
        return {"error": "No JSON found in the prompt"}

@app.route('/', methods=['GET'])
def status_check():
    return "Server is running"

@app.route('/generate_question', methods=['GET'])
def generate_question():
    try:
        # Placeholder prompt for generating a question
        prompt = """
        The CASPer exam aims to test professionalism, ethics, communication, and empathy. Here is a sample question scenario:

        Scenario Description:
        A co-worker, whose wife is pregnant, is conflicted about taking paternity leave due to potential negative implications for his career advancement, despite both he and his wife wanting him at home with the baby.


        {
        "scenario": "A co-worker whose wife is pregnant is conflicted whether or not to take paternity leave. He and his wife would both like him to spend time at home with the baby, but doing so might take him out of consideration for an upcoming promotion at work.",
        "question_1": "Should he prioritize family or career? In addition, his industry doesn’t seem to support men who take paternity leave. A former colleague was penalized for taking leave and spent years stuck in the same position before finally leaving the company. As his co-worker, what do you think he should do?",
        "question_2": "Would you recommend he take paternity leave? Why or why not?",
        "question_3": "What strategies could you offer to help him make a decision that he feels comfortable with? Maintaining a work-life balance can be challenging."
        }

        Here is another example, 

        Scenario: "scenario": "Two peers are working on a group assignment, discussing how their third group member, Paul, has been unable to do his work due to a medical condition. Then, a group member discovers a post showing Paul at a pool party, and the legitimacy of Paul’s medical condition is questioned. There is no indication of when the picture was taken. The team wonders if they should tell their subject coordinator, so Paul doesn’t receive credit for the assignment.",
        Question 1: "What do you recommend to your group members?",
        Question 2: "Do you think it is okay to report a concern to a supervisor based on a suspicion?",
        Question 3: "Do you believe that one false or inappropriate post on social media can have a lasting effect on someone’s career?",

        According to Acuity Insights, you might end up in a higher quartile based on these five reasons:

        Effort: You explained your position clearly and used the full allotted time to answer as thoroughly as possible compared to peers in the first quartile.
        Empathy: You meaningfully considered all perspectives in the scenario.
        Equity: You showed a great deal of respect and fairness in regards to the needs of others in the scenario.
        Communication: You articulated your points very well.
        Familiarity with the medium: You successfully navigated each aspect of the test, indicating you took ample time to familiarize yourself with Casper requirements.

        Please generate questionst that are similar to the ones above and that test those qualities. 

        Generate a question in this JSON format where a scenario is followed by three questions.
        {
        "scenario": "Your scenario here",
        "question_1": "Your question here",
        "question_2": "Your question here",
        "question_3": "Your question here",
        }

        Remember to output only one scenario and three questions.
        """
        app.logger.info("Sending request to LLM server for generating a question")
        response = chat_api(prompt)
        
        app.logger.info("Received generating question response from server")

        json_extracted = extract_json(response)
        return jsonify(json_extracted)
    except Exception as e:
        app.logger.error(f"An error occurred while generating a question: {e}")
        return jsonify(error="An error occurred while generating a question"), 500


@app.route('/score_answer', methods=['POST'])
def score_answer():
    try:
        # Use ollama to score the answer provided by the user
        data = request.json
        if not data:
            return jsonify(error="No answers provided"), 400
        
        scenario = data["scenario"]
        question_1 = data["question_1"]
        question_2 = data["question_2"]
        question_3 = data["question_3"]
        answer_1 = data["answer_1"]
        answer_2 = data["answer_2"]
        answer_3 = data["answer_3"]

        prompt = f"""
            The following responses have been provided to a given scenario with three questions. Each response should be scored on a scale from 1 to 9, where 1 is the worst and 9 is the best. Scores should reflect the respondent's effort, empathy, equity, communication skills, and familiarity with the test medium. Each score should be accompanied by a critique explaining the rationale behind the score.

            Scenario:
            {scenario}

            Questions and Responses:
            1. Question: {question_1}
            Response: {answer_1}

            2. Question: {question_2}
            Response: {answer_2}

            3. Question: {question_3}
            Response: {answer_3}

            Scoring Criteria:
            - Effort: Clear explanation and thorough use of allotted time.
            - Empathy: Consideration of all perspectives.
            - Equity: Respect and fairness regarding others' needs.
            - Communication: Clarity and articulation of points.
            - Familiarity: Understanding of test requirements.

            Your task is to score each response based on the criteria above. Provide a score and a brief critique for each response. Ensure the output is in the following JSON format:

            {{
            "score_1": ["score", "critique explaining the score"],
            "score_2": ["score", "critique explaining the score"],
            "score_3": ["score", "critique explaining the score"]
            }}

            Note: Only return the JSON object as described.
        """

        app.logger.info("Sending request to LLM server for scoring")
        response = chat_api(prompt)

        app.logger.info("Received scoring response from server")

        json_extracted = extract_json(response)
        return jsonify(json_extracted)
    except Exception as e:
        # Log the exception and return an error message
        app.logger.error(f"An error occurred while scoring an answer: {e}")
        return jsonify(error="An error occurred while scoring an answer"), 500

if __name__ == '__main__':
    app.run(debug=False)
