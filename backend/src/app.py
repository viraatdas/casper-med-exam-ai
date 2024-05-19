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

# Initialize the ollama client 
ollama_client = ollama.Client()
# Check if the application is in debug mode or not
environment = os.environ.get('FLASK_ENV', 'production')
is_debug = environment == 'development' or app.debug

llm_model = "llama3:70b" if not is_debug else "llama3"


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
        app.logger.info("Sending request to Ollama server for question generation")
        response = ollama_client.chat(model=llm_model, messages=[{'role': 'system', 'content': prompt}])
        print("response", response)
        app.logger.info("Received response from Ollama server for question generation")
        # Assuming the response contains a 'message' key with the generated question as its content
        output = response['message']['content']
        json_extracted = extract_json(output)
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

          The scenario was:

          {scenario}

          The questions were: 

          1. {question_1}

          2. {question_2}

          3. {question_3}

          Grade the responses: 
          
          1. {answer_1}

          2. {answer_2}

          3. {answer_3}
          
          This is the criteria that Casper uses:

          A Casper response is scored relative to other responses to the same scenario. This means your score signifies the strength of your response compared to other test takers’ responses. Raters are trained to use a likert scale ranging from 1 to 9 (1 being poor and 9 being excellent) to evaluate responses.

          Each response score is a function of how well the applicant demonstrates social intelligence and professionalism characteristics, as well as how the response compares to other applicants’ responses to the same scenario in the same test sitting.

          Score based on these five reasons:
          Effort: You explained your position clearly and used the full allotted time to answer as thoroughly as possible compared to peers in the first quartile.
          Empathy: You meaningfully considered all perspectives in the scenario.
          Equity: You showed a great deal of respect and fairness in regards to the needs of others in the scenario.
          Communication: You articulated your points very well.
          Familiarity with the medium: You successfully navigated each aspect of the test, indicating you took ample time to familiarize yourself with Casper requirements.

          Consider that when scording. 
        
          Whenever you are scoring it, give a score of 1-9. 1 being the worst and 9 being the best. If the answer is too short or not relevant give it a 1. If the answer is well thought out, relevant, and shows a good understanding of the scenario, give it a higher score.

          Try to penalize responses with not too many words. 

          Only output a number followed by a critique on why it was graded. so the format is
          {{
            "score_1": ["score", "critique as to why it was scored that"],
            "score_2": ["score", "critique as to why it was scored that"],
            "score_3": ["score", "critique as to why it was scored that"],
          }}

          Remember there should only be three answers that you are grading and thus there should only be three scores produced.

        """

        app.logger.info("Sending request to Ollama server for scoring")
        response = ollama_client.chat(model=llm_model, messages=[{'role': 'system', 'content': prompt}])
        app.logger.info("Received response from Ollama server for scoring")
          
        output = response['message']['content']
        json_extracted = extract_json(output)
        return jsonify(json_extracted)
    except Exception as e:
        # Log the exception and return an error message
        app.logger.error(f"An error occurred while scoring an answer: {e}")
        return jsonify(error="An error occurred while scoring an answer"), 500

if __name__ == '__main__':
    app.run(debug=False)
