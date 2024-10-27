import os
import anthropic
from typing import Dict, Union
import json
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# Initialize FastAPI app
app = FastAPI()

class TextSimplifier:
    def __init__(self):
        """Initialize the TextSimplifier with Anthropic API key."""
        load_dotenv()
        self.client = anthropic.Anthropic(api_key="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")
        self.complexity_levels = self._load_complexity_levels()

    def _load_complexity_levels(self) -> Dict:
        """Load complexity levels from the levels.json file."""
        parent_directory = os.path.abspath(os.path.join(os.path.dirname(__file__), '.'))
        file_path = os.path.join(parent_directory, 'levels.json')
        try:
            with open(file_path, 'r') as f:
                data = json.load(f)
                return {level['Level']: level for level in data['complexityLevels']}
        except FileNotFoundError:
            raise FileNotFoundError("levels.json file not found. Please ensure it exists in the current directory.")
        except json.JSONDecodeError:
            raise ValueError("Invalid JSON format in levels.json file.")

    def simplify_text(self, text_dict: Dict[int, str], target_level: int) -> Dict[str, Union[str, Dict]]:
        """
        Simplify the given text to the target complexity level.
        
        Args:
            text_dict (Dict[int, str]): Dict containing all past versions of text and their complexity levels (first entry of Dict is the original text and its complexity level (level 5))
            target_level (int): The desired complexity level (1-5)
            
        Returns:
            Dict containing simplified text and metadata
        """
        if not 1 <= target_level <= 5:
            raise ValueError("Target level must be between 1 and 5")

        # Get complexity parameters and description for target level
        level_data = self.complexity_levels[target_level]
        target_complexity = level_data['Complexity']
        description = level_data['Description']

        # Construct the prompt for Claude
        system_prompt = f"""You are an expert in linguistic simplification. Your task is to rewrite text to match specific complexity levels while maintaining the core meaning.

                            Target complexity level {target_level} characteristics:
                            {description}

                            Your focus should primarily be on the above description, which outlines the desired qualities of the text at this complexity level. Although the 
                            complexity parameters are important, they should serve as guidelines rather than strict rules.

                            Specific parameters (relative to original text):
                            - Sentence Structure: {target_complexity['SentenceStructure']}
                            - Vocabulary: {target_complexity['VocabularyFamiliarity']}
                            - Conceptual Density: {target_complexity['ConceptualDensity']}
                            - Cohesion: {target_complexity['Cohesion']}

                            You are given one or more provided texts with their relative complexity levels. The first provided text is the original text and defined as complexity 
                            level 5. If there are any subsequent texts, they represent simplified versions of the original text, with their relative complexity levels in regard 
                            to the original text given. Your task is to simplify the original text, sentence by sentence, to match the characteristics of the target complexity 
                            level, taking into account all previous versions and their relative complexity levels to the original text. Focus on maintaining the core meaning 
                            while adhering to the specified relative complexity level. Additionally, if the target complexity level is the same as that of a provided text, return 
                            that exact provided text. Provide only the simplified text without explanations."""

        text = ""
        for complexity_level, text_version in text_dict.items():
            text += f"Complexity level: {complexity_level}\n{text_version}"

        try:
            # Call Claude API
            message = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=1000,
                temperature=0.2,
                system=system_prompt,
                messages=[{
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": text
                        }
                    ]
                }]
            )

            simplified_text = message.content[0].text.strip()

            return {
                "original_text": next(iter(text_dict.values())),
                "simplified_text": simplified_text,
                "target_level": target_level,
                "complexity_parameters": target_complexity,
                "target_description": description,
                "status": "success"
            }

        except Exception as e:
            return {
                "status": "error",
                "error_message": str(e),
                "original_text": text,
                "target_level": target_level
            }

# Define request models for the API
class TextRequest(BaseModel):
    text_dict: Dict[int, str]
    target_level: int

@app.post('/simplify')
def simplify(request: TextRequest):
    """
    Simplify text based on the specified complexity level.
    """
    text_dict = request.text_dict
    target_level = request.target_level

    if not (1 <= target_level <= 5):
        raise HTTPException(status_code=400, detail="Target level must be between 1 and 5")

    simplifier = TextSimplifier()
    result = simplifier.simplify_text(text_dict, target_level)
    print(result)
    return result["simplified_text"]

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8020, log_level="info")