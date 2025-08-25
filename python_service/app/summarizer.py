from transformers import T5Tokenizer, T5ForConditionalGeneration
import torch
import os
import requests
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

class TextSummarizer:
    def __init__(self):
        self.model_name = os.getenv('MODEL_NAME', 't5-small')
        self.fallback_model = os.getenv('FALLBACK_MODEL', 'sshleifer/distilbart-cnn-12-6')
        self.api_key = os.getenv('HUGGINGFACE_API_KEY')
        self.api_url = f"https://api-inference.huggingface.co/models/{self.fallback_model}"
        
        # Try to load local model
        try:
            self.tokenizer = T5Tokenizer.from_pretrained(self.model_name)
            self.model = T5ForConditionalGeneration.from_pretrained(self.model_name)
            self.device = torch.device("cpu")
            self.model.to(self.device)
            self.use_local = True
            logging.info("Using local model for summarization")
        except Exception as e:
            logging.warning(f"Failed to load local model: {e}")
            self.use_local = False
            logging.info("Will use Hugging Face API for summarization")

    def summarize(self, text: str, max_length: int = 550, min_length: int = 40) -> str:
        try:
            if self.use_local:
                return self._local_summarize(text, max_length, min_length)
            else:
                return self._api_summarize(text)
        except Exception as e:
            # If local summarization fails, try API as fallback
            try:
                return self._api_summarize(text)
            except Exception as api_e:
                raise Exception(f"Both local and API summarization failed: {str(e)} | API Error: {str(api_e)}")

    def _local_summarize(self, text: str, max_length: int = 550, min_length: int = 40) -> str:
        # Prepare the text input
        preprocess_text = text.strip().replace("\n", " ")
        t5_input = "summarize: " + preprocess_text

        # Tokenize the input
        tokenized_text = self.tokenizer.encode(t5_input, return_tensors="pt", max_length=512, truncation=True)

        # Generate summary
        summary_ids = self.model.generate(
            tokenized_text,
            max_length=max_length,
            min_length=min_length,
            length_penalty=2.0,
            num_beams=4,
            early_stopping=True
        )

        # Decode the summary
        summary = self.tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        return summary

    def _api_summarize(self, text: str) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        data = {"inputs": text}
        
        response = requests.post(self.api_url, headers=headers, json=data)
        if response.status_code != 200:
            raise Exception(f"API request failed with status code {response.status_code}: {response.text}")
            
        result = response.json()
        if isinstance(result, list) and len(result) > 0 and "summary_text" in result[0]:
            return result[0]["summary_text"]
        else:
            raise Exception("Unexpected API response format") 