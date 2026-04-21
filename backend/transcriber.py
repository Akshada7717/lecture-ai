import ssl
ssl._create_default_https_context = ssl._create_unverified_context

import static_ffmpeg
static_ffmpeg.add_paths()

import whisper

model = None

def load_model():
    global model
    if model is None:
        print("Loading Whisper model...")
        model = whisper.load_model("base")
        print("Whisper loaded.")
    return model

def transcribe(audio_path: str) -> dict:
    m = load_model()
    print(f"Transcribing: {audio_path}")
    result = m.transcribe(audio_path)
    return {
        "text": result["text"].strip(),
        "language": result.get("language", "en")
    }