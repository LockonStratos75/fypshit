from fastapi import FastAPI, UploadFile, File
from transformers import pipeline
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware
# from dotenv import load_dotenv
# import os

app = FastAPI()

# # Allow all origins (adjust as needed)
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # Adjust this in production
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# Initialize the pipeline for audio classification
pipe = pipeline("audio-classification", model="firdhokk/speech-emotion-recognition-with-openai-whisper-large-v3")

# Define the response model
class EmotionPrediction(BaseModel):
    label: str
    score: float

class EmotionResponse(BaseModel):
    emotions: List[EmotionPrediction]
    highestEmotion: EmotionPrediction

@app.get("/")
async def root():
    return {"message": "Welcome to the API!"}

@app.post("/predict", response_model=EmotionResponse)
async def predict(file: UploadFile = File(...)):
    # Read the audio file data
    audio_data = await file.read()

    # Run audio classification
    results = pipe(audio_data)

    # Sort emotions by score and get the highest emotion
    sorted_emotions = sorted(results, key=lambda x: x['score'], reverse=True)
    highest_emotion = sorted_emotions[0]
    emotions = [{"label": emotion["label"], "score": emotion["score"]} for emotion in sorted_emotions]

    return {
        "emotions": emotions,
        "highestEmotion": highest_emotion
    }
