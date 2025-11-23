from flask import Flask, render_template, request
import requests

app = Flask(__name__)

LLM_URL = "http://127.0.0.1:1234/v1/chat/completions"  # route correcte pour LM Studio

@app.route('/')
def index():
    return "<h3>Bienvenue !</h3><p>Essaye <a href='/template/testjstree'>/template/testjstree</a></p>"

@app.route('/template/testjstree')
def test_jstree():
    return render_template('testjstree.html')

@app.route('/node_editor')
def node_editor():
    return render_template('node_editor.html')



if __name__ == "__main__":
    app.run(debug=True)

'''@app.route("/", methods=["GET", "POST"])
def home():
    response = None
    if request.method == "POST":
        message = request.form.get("message")
        try:
            payload = {
                "model": "qwen3-14b",
                "messages": [
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": message}
                ],
                "temperature": 0.7,
                "max_tokens": -1,
                "stream": False
            }
            r = requests.post(LLM_URL, json=payload)
            r.raise_for_status()
            data = r.json()
            # Extraction du contenu de la réponse
            response = data["choices"][0]["message"]["content"]
        except Exception as e:
            response = f"Erreur : {e}"
    return render_template("test.html", response=response)'''
