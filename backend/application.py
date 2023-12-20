from flask import Flask, jsonify, request
from flask_cors import CORS

import sys
sys.path.insert(1, './research_agent-main')
from research_agent_v2 import get_final_answer

app = Flask(__name__)
CORS(app) 
@app.route('/QA_Agent', methods=['GET', 'POST'])
def QA_Agent():
    data = request.json
    question = data['question']
    namespace = data['chatTitle']
    if request.method == 'GET':
        print("Received GET request")
        print(question)

    final_answer = get_final_answer(question, namespace)
    print(final_answer)
    return jsonify({'answer': final_answer})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
