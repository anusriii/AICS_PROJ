import re
from typing import Dict, Any, List


FILLER_WORDS = [
    r"\bum\b", r"\buh\b", r"\blike\b", r"\byou know\b", r"\bbasically\b",
    r"\bactually\b", r"\bliterally\b", r"\bsort of\b", r"\bkind of\b",
    r"\bi mean\b", r"\bright\b\?"
]


def analyze_speech_metrics(
    transcript: str,
    duration_seconds: float,
    pause_count: int = 0,
    long_pause_duration_sec: float = 0.0
) -> Dict[str, Any]:
    """
    Computes presentation-oriented speech characteristics from verbal transcripts and recording timing.
    Strictly framed as communication cadence metrics, not psychological or cognitive indicators.
    """
    text_clean = transcript.strip()
    words = [w for w in re.findall(r"\b\w+\b", text_clean)]
    total_words = len(words)

    # Filler words count
    filler_matches = []
    text_lower = text_clean.lower()
    for pattern in FILLER_WORDS:
        found = re.findall(pattern, text_lower)
        filler_matches.extend(found)
    filler_count = len(filler_matches)

    # Words Per Minute (WPM) calculation
    duration_minutes = duration_seconds / 60.0 if duration_seconds > 0 else (total_words / 130.0)
    wpm = round(total_words / duration_minutes, 1) if duration_minutes > 0 else 0.0

    # Presentation Cadence Evaluation
    if wpm == 0:
        pace_label = "No Speech Detected"
    elif wpm < 100:
        pace_label = "Deliberate / Slow Pace (Consider pacing up slightly)"
    elif 100 <= wpm <= 160:
        pace_label = "Optimal Conversational Cadence"
    else:
        pace_label = "Fast Cadence (Consider pausing between major concepts)"

    # Format duration
    mins = int(duration_seconds // 60)
    secs = int(duration_seconds % 60)
    formatted_duration = f"{mins}m {secs}s" if mins > 0 else f"{secs}s"

    return {
        "words_spoken": total_words,
        "speaking_rate_wpm": wpm,
        "pace_classification": pace_label,
        "filler_words_count": filler_count,
        "detected_fillers": list(set(filler_matches)),
        "pause_count": pause_count,
        "long_pause_duration_sec": round(long_pause_duration_sec, 1),
        "duration_seconds": round(duration_seconds, 1),
        "formatted_duration": formatted_duration,
        "disclaimer": "Metrics are technical speech delivery indicators designed for presentation practice only."
    }
