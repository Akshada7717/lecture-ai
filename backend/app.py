import ssl
ssl._create_default_https_context = ssl._create_unverified_context

import static_ffmpeg
static_ffmpeg.add_paths()

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os, uuid, json

from database import init_db, get_db
from transcriber import transcribe
from summarizer import summarize
from quiz_generator import generate_quiz, extract_keywords
from fpdf import FPDF

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs("exports", exist_ok=True)

init_db()

# ── HOME ──────────────────────────────────────────────────────────
@app.route("/")
def home():
    return jsonify({"message": "LectureAI Backend running successfully!"})

# ── UPLOAD LOCAL FILE ─────────────────────────────────────────────
@app.route("/api/upload", methods=["POST"])
def upload():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    title = request.form.get("title", file.filename)
    video_id = str(uuid.uuid4())[:8]
    ext = os.path.splitext(file.filename)[1]
    save_path = os.path.join(UPLOAD_FOLDER, f"{video_id}{ext}")
    file.save(save_path)

    try:
        print("Step 1: Transcribing...")
        result = transcribe(save_path)
        transcript = result["text"]
        language = result["language"]

        print("Step 2: Summarizing...")
        summary = summarize(transcript)

        print("Step 3: Extracting keywords...")
        keywords = extract_keywords(summary)

        print("Step 4: Generating quiz...")
        questions = generate_quiz(summary, num_questions=5)

        db = get_db()
        db.execute(
            "INSERT INTO videos (id, title, transcript, summary, keywords, questions, language) VALUES (?,?,?,?,?,?,?)",
            (video_id, title, transcript, summary, json.dumps(keywords), json.dumps(questions), language)
        )
        db.commit()
        db.close()

        return jsonify({
            "video_id": video_id,
            "title": title,
            "language": language,
            "transcript": transcript,
            "summary": summary,
            "keywords": keywords,
            "questions": questions,
            "quiz_link": f"http://192.168.1.18:5173/quiz/{video_id}"
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# ── UPLOAD YOUTUBE LINK ───────────────────────────────────────────
@app.route("/api/upload-youtube", methods=["POST"])
def upload_youtube():
    data = request.json
    url = data.get("url", "").strip()
    if not url:
        return jsonify({"error": "No YouTube URL provided"}), 400

    try:
        from youtube_downloader import download_youtube_audio
        print(f"Downloading YouTube: {url}")
        audio_path, yt_title = download_youtube_audio(url)
        title = data.get("title") or yt_title
        video_id = str(uuid.uuid4())[:8]

        print("Step 1: Transcribing...")
        result = transcribe(audio_path)
        transcript = result["text"]
        language = result["language"]

        print("Step 2: Summarizing...")
        summary = summarize(transcript)

        print("Step 3: Extracting keywords...")
        keywords = extract_keywords(summary)

        print("Step 4: Generating quiz...")
        questions = generate_quiz(summary, num_questions=5)

        db = get_db()
        db.execute(
            "INSERT INTO videos (id, title, transcript, summary, keywords, questions, language) VALUES (?,?,?,?,?,?,?)",
            (video_id, title, transcript, summary, json.dumps(keywords), json.dumps(questions), language)
        )
        db.commit()
        db.close()

        return jsonify({
            "video_id": video_id,
            "title": title,
            "language": language,
            "transcript": transcript,
            "summary": summary,
            "keywords": keywords,
            "questions": questions,
            "quiz_link": f"http://192.168.1.18:5173/quiz/{video_id}"
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# ── GET QUIZ (student facing) ─────────────────────────────────────
@app.route("/api/quiz/<video_id>", methods=["GET"])
def get_quiz(video_id):
    db = get_db()
    row = db.execute("SELECT * FROM videos WHERE id=?", (video_id,)).fetchone()
    db.close()
    if not row:
        return jsonify({"error": "Quiz not found"}), 404
    questions = json.loads(row["questions"])
    safe_questions = [{"question": q["question"], "options": q["options"]} for q in questions]
    return jsonify({
        "video_id": video_id,
        "title": row["title"],
        "questions": safe_questions,
        "total": len(safe_questions)
    })

# ── SUBMIT QUIZ ───────────────────────────────────────────────────
@app.route("/api/submit", methods=["POST"])
def submit_quiz():
    data = request.json
    video_id = data.get("video_id")
    name = data.get("name")
    roll = data.get("roll")
    answers = data.get("answers", [])

    db = get_db()
    row = db.execute("SELECT questions FROM videos WHERE id=?", (video_id,)).fetchone()
    if not row:
        db.close()
        return jsonify({"error": "Quiz not found"}), 404

    questions = json.loads(row["questions"])
    score = sum(
        1 for i, q in enumerate(questions)
        if i < len(answers) and answers[i] == q["answer"]
    )
    total = len(questions)

    db.execute(
        "INSERT INTO submissions (video_id, student_name, roll_no, score, total, answers) VALUES (?,?,?,?,?,?)",
        (video_id, name, roll, score, total, json.dumps(answers))
    )
    db.commit()
    db.close()

    return jsonify({
        "score": score,
        "total": total,
        "percentage": round((score / total) * 100),
        "name": name
    })

# ── GET RESULTS (admin) ───────────────────────────────────────────
@app.route("/api/results/<video_id>", methods=["GET"])
def get_results(video_id):
    db = get_db()
    video = db.execute("SELECT title FROM videos WHERE id=?", (video_id,)).fetchone()
    rows = db.execute(
        "SELECT student_name, roll_no, score, total, submitted_at FROM submissions WHERE video_id=? ORDER BY submitted_at DESC",
        (video_id,)
    ).fetchall()
    db.close()
    students = [dict(r) for r in rows]
    avg = round(sum(s["score"] for s in students) / len(students), 1) if students else 0
    return jsonify({
        "title": video["title"] if video else "",
        "students": students,
        "total_submissions": len(students),
        "average_score": avg
    })

# ── GET ALL VIDEOS (admin list) ───────────────────────────────────
@app.route("/api/videos", methods=["GET"])
def get_videos():
    db = get_db()
    rows = db.execute(
        "SELECT v.id, v.title, v.language, v.created_at, COUNT(s.id) as submissions "
        "FROM videos v LEFT JOIN submissions s ON v.id=s.video_id "
        "GROUP BY v.id ORDER BY v.created_at DESC"
    ).fetchall()
    db.close()
    return jsonify([dict(r) for r in rows])

# ── PDF EXPORT ────────────────────────────────────────────────────
@app.route("/api/export/<video_id>", methods=["GET"])
def export_pdf(video_id):
    db = get_db()
    row = db.execute("SELECT * FROM videos WHERE id=?", (video_id,)).fetchone()
    db.close()
    if not row:
        return jsonify({"error": "Not found"}), 404

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 10, row["title"], ln=True)
    pdf.set_font("Helvetica", "", 11)
    pdf.ln(4)
    lang = row["language"].upper()
    pdf.multi_cell(0, 7, "Language: " + lang)
    pdf.ln(4)
    pdf.set_font("Helvetica", "B", 13)
    pdf.cell(0, 10, "Summary", ln=True)
    pdf.set_font("Helvetica", "", 11)
    pdf.multi_cell(0, 7, row["summary"])
    pdf.ln(4)
    pdf.set_font("Helvetica", "B", 13)
    pdf.cell(0, 10, "Quiz Questions", ln=True)
    questions = json.loads(row["questions"])
    for i, q in enumerate(questions, 1):
        pdf.set_font("Helvetica", "B", 11)
        qtext = q["question"]
        pdf.multi_cell(0, 7, "Q" + str(i) + ". " + qtext)
        pdf.set_font("Helvetica", "", 10)
        for j, opt in enumerate(q["options"]):
            marker = "* " if j == q["answer"] else "  "
            pdf.cell(0, 6, "  " + marker + chr(65+j) + ") " + opt, ln=True)
        pdf.ln(3)

    out_path = "exports/" + video_id + ".pdf"
    pdf.output(out_path)
    return send_file(out_path, as_attachment=True)
    
if __name__ == "__main__":
    app.run(debug=True, port=8080, host='0.0.0.0')