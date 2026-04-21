import ssl
ssl._create_default_https_context = ssl._create_unverified_context

import static_ffmpeg
static_ffmpeg.add_paths()

import yt_dlp
import os

def download_youtube_audio(url: str, output_dir: str = "uploads") -> tuple:
    os.makedirs(output_dir, exist_ok=True)

    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": os.path.join(output_dir, "%(id)s.%(ext)s"),
        "quiet": True,
        "no_warnings": True,
        "extract_audio": True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        video_id = info["id"]
        title = info.get("title", "YouTube Lecture")

        # find downloaded file
        for ext in ["webm", "m4a", "mp3", "opus", "wav"]:
            path = os.path.join(output_dir, f"{video_id}.{ext}")
            if os.path.exists(path):
                return path, title

        raise Exception("Downloaded file not found")