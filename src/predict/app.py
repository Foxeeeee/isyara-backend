import tensorflow as tf
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

model = tf.keras.models.load_model('../models/model_isyara.h5')

def normalize_coordinates(coordinates):
    hand_landmarks = np.reshape(coordinates, (1, -1))
    return hand_landmarks

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        hand_landmarks = data['coordinates']
        normalized_landmarks = normalize_coordinates(hand_landmarks)
        input_tensor = tf.convert_to_tensor(normalized_landmarks, dtype=tf.float32)

        prediction = model.predict(input_tensor, verbose=0)
        predicted_class = np.argmax(prediction)

        label = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]

        return jsonify({'prediction: ': label[predicted_class]}), 200

    except Exception as e:
        return jsonify({'error: ': str(e)}), 400
    
if __name__ == '__main__':
    app.run(debug=True, port=5000)