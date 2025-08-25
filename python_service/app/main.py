from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
import sys
import os
from typing import Dict

# Adding the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from summarizer import TextSummarizer

app = FastAPI(title="Text Summarization API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

summarizer = TextSummarizer()

class TextInput(BaseModel):
    text: str

    @validator('text')
    def validate_text(cls, v):
        if not v or len(v.strip()) < 100:
            raise ValueError("Text must be at least 100 characters long for meaningful summarization")
        return v.strip()

@app.post("/summarize", response_model=Dict[str, str])
async def summarize_text(input_data: TextInput):
    try:
        summary = summarizer.summarize(input_data.text)
        return {"summary": summary}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 