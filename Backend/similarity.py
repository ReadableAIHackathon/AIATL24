from fastapi import FastAPI, Query
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
import re

app = FastAPI()

class SimilarityRequest(BaseModel):
    transcribed_text: str
    expected_text: str

@app.post('/calculate_similarity')
def calculate_similarity(request: SimilarityRequest):
    """Calculates the similarity index between two texts using TF-IDF, punctuation lenient."""

    t_text = request.transcribed_text
    e_text = request.expected_text

    def preprocess(text):
        text = text.lower()
        text = re.sub(r'[^\w\s]', '', text)
        return text.split()

    t_text = preprocess(t_text)
    e_text = preprocess(e_text)

    if not t_text or not e_text:
        return 0

    t_text = " ".join(t_text)
    e_text = " ".join(e_text)

    vectorizer = TfidfVectorizer()
    tfidf = vectorizer.fit_transform([t_text, e_text])

    similarity_matrix = (tfidf * tfidf.T).toarray()
    similarity = similarity_matrix[0, 1]
    print(similarity)
    if similarity * 100 >= 60:
        return {'Score': 1}
    else:
        return {'Score': 0}
    
if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8040, log_level="info")
