import requests

data = {
    "math_grade": 85,
    "engineering_sciences_grade": 80,
    "electrical_subjects_grade": 78,
    "preboard_score": 70
}

response = requests.post("http://127.0.0.1:8000/predict", json=data)
print(response.json())
