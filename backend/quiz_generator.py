import ssl
ssl._create_default_https_context = ssl._create_unverified_context

from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from keybert import KeyBERT
import random

qg_model = None
qg_tokenizer = None
kw_model = None

def load_models():
    global qg_model, qg_tokenizer, kw_model
    if qg_model is None:
        print("Loading QG model...")
        qg_tokenizer = AutoTokenizer.from_pretrained("potsawee/t5-large-generation-squad-QuestionAnswer")
        qg_model = AutoModelForSeq2SeqLM.from_pretrained("potsawee/t5-large-generation-squad-QuestionAnswer")
        print("QG model loaded.")
    if kw_model is None:
        kw_model = KeyBERT()

def extract_keywords(text: str, n=12) -> list:
    load_models()
    keywords = kw_model.extract_keywords(
        text,
        keyphrase_ngram_range=(1, 2),
        stop_words="english",
        top_n=n
    )
    return [k[0] for k in keywords]

def generate_question_and_answer(context: str):
    input_text = "generate question: " + context
    input_ids = qg_tokenizer(
        input_text,
        return_tensors="pt",
        max_length=512,
        truncation=True
    ).input_ids
    outputs = qg_model.generate(
        input_ids,
        max_length=128,
        num_beams=4,
        early_stopping=True
    )
    decoded = qg_tokenizer.decode(outputs[0], skip_special_tokens=True)
    if "<sep>" in decoded:
        parts = decoded.split("<sep>")
        question = parts[0].strip()
        answer = parts[1].strip() if len(parts) > 1 else ""
    else:
        question = decoded.strip()
        answer = ""
    return question, answer

def make_distractors(keywords: list, correct: str, n=3) -> list:
    pool = [k for k in keywords if k.lower() != correct.lower()]
    random.shuffle(pool)
    distractors = pool[:n]
    while len(distractors) < n:
        distractors.append("None of the above")
    return distractors

def generate_quiz(summary: str, num_questions=5) -> list:
    load_models()
    keywords = extract_keywords(summary, n=15)
    sentences = [s.strip() for s in summary.split(".") if len(s.strip()) > 20]
    questions = []
    used_sentences = set()

    for sentence in sentences:
        if len(questions) >= num_questions:
            break
        if sentence in used_sentences:
            continue
        try:
            question, answer = generate_question_and_answer(sentence)
            if not question or len(question) < 8:
                continue
            if not answer:
                answer = keywords[len(questions)] if len(keywords) > len(questions) else "None"
            distractors = make_distractors(keywords, answer)
            options = distractors + [answer]
            random.shuffle(options)
            correct_idx = options.index(answer)
            questions.append({
                "question": question,
                "options": options,
                "answer": correct_idx
            })
            used_sentences.add(sentence)
        except Exception as e:
            print(f"QG error: {e}")
            continue

    return questions