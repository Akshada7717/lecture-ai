import ssl
ssl._create_default_https_context = ssl._create_unverified_context

from transformers import BartForConditionalGeneration, BartTokenizer

model = None
tokenizer = None

def load_summarizer():
    global model, tokenizer
    if model is None:
        print("Loading BART summarizer...")
        tokenizer = BartTokenizer.from_pretrained("facebook/bart-large-cnn")
        model = BartForConditionalGeneration.from_pretrained("facebook/bart-large-cnn")
        print("BART loaded.")

def chunk_text(text, max_words=400):
    words = text.split()
    chunks = []
    for i in range(0, len(words), max_words):
        chunks.append(" ".join(words[i:i+max_words]))
    return chunks

def summarize(text: str) -> str:
    load_summarizer()
    word_count = len(text.split())

    if word_count < 80:
        return text

    chunks = chunk_text(text, max_words=400)
    summaries = []

    for chunk in chunks:
        if len(chunk.split()) < 20:
            continue
        inputs = tokenizer(
            chunk,
            return_tensors="pt",
            max_length=1024,
            truncation=True
        )
        summary_ids = model.generate(
            inputs["input_ids"],
            max_length=180,
            min_length=30,
            length_penalty=2.0,
            num_beams=4,
            early_stopping=True
        )
        summary = tokenizer.decode(
            summary_ids[0],
            skip_special_tokens=True
        )
        summaries.append(summary)

    return " ".join(summaries)