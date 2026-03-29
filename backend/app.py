from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
import numpy as np

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ee-predictor.netlify.app",
        "https://slsureeboardexampredictor.com/",
        "http://localhost:3000",  # keep for local dev
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load("ree_survey_model.pkl")

@app.post("/predict")
def predict(data: dict):

    features = np.array([
        data["EE"],
        data["MATH"],
        data["ESAS"],
        data["GWA"],
        data["Senior_High_School_Strand"],
        data["Review_Program"],
        data["Study_Habits"],
        data["Math_Foundation"]
    ]).reshape(1, -1)

    prediction = model.predict(features)[0]
    probability = model.predict_proba(features)[0][1]

    return {
        "prediction": int(prediction),
        "probability": float(probability)
    }