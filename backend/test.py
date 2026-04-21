import ssl
ssl._create_default_https_context = ssl._create_unverified_context

import static_ffmpeg
static_ffmpeg.add_paths()

from transcriber import transcribe
from summarizer import summarize
from quiz_generator import generate_quiz, extract_keywords

print("Testing transcription...")
result = transcribe("sample.mp3")
print("\nLANGUAGE:", result["language"])
print("\nTRANSCRIPT:\n", result["text"])

print("\nTesting summarization...")
summary = summarize(result["text"])
print("\nSUMMARY:\n", summary)

print("\nTesting keyword extraction...")
keywords = extract_keywords(summary)
print("\nKEYWORDS:", keywords)

print("\nTesting quiz generation...")
questions = generate_quiz(summary, num_questions=5)
print(f"\nGENERATED {len(questions)} QUESTIONS:")
for i, q in enumerate(questions, 1):
    print(f"\nQ{i}: {q['question']}")
    for j, opt in enumerate(q['options']):
        marker = "✓" if j == q['answer'] else " "
        print(f"  {marker} {chr(65+j)}) {opt}")

print("\nAll tests passed!")