from typing import Dict, Any


def analyze_presentation_signals(
    face_visibility_ratio: float = 0.95,
    posture_stability_score: float = 8.5,
    presentation_consistency: float = 8.0,
    duration_seconds: float = 60.0
) -> Dict[str, Any]:
    """
    Evaluates technically defensible presentation and webcam video signals.
    Emphasizes visual framing stability and camera presence.
    Explicitly decoupled from personality or psychological claims.
    """
    bounded_face = max(0.0, min(1.0, face_visibility_ratio))
    bounded_posture = max(0.0, min(10.0, posture_stability_score))
    bounded_consistency = max(0.0, min(10.0, presentation_consistency))

    # Overall Presentation Composite (0 to 10)
    score = round((bounded_face * 10 * 0.4) + (bounded_posture * 0.3) + (bounded_consistency * 0.3), 1)

    observations = []
    if bounded_face >= 0.85:
        observations.append("Candidate maintained high visual framing in webcam view.")
    else:
        observations.append("Occasional camera drift or low webcam visibility detected.")

    if bounded_posture >= 7.5:
        observations.append("Consistent, stable presentation posture throughout the response.")
    else:
        observations.append("Frequent movement or shifting observed during delivery.")

    return {
        "face_visibility_percentage": round(bounded_face * 100, 1),
        "posture_stability_score": bounded_posture,
        "presentation_consistency_score": bounded_consistency,
        "composite_presentation_score": score,
        "observations": observations,
        "disclaimer": (
            "Notice: Presentation metrics reflect camera framing, lighting, and visual consistency for "
            "video interview rehearsal. They do NOT evaluate personality, psychological attributes, "
            "honesty, or employability."
        )
    }
