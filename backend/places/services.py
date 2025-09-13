# TODO: To inject a city-centroid geocoder later
from typing import Dict, Any, Tuple

from places.models import Submission, Candidate


def geocode_if_needed(sub: Submission) -> Tuple[float | None, float | None, str]:
    if sub.lat is not None and sub.lng is not None:
        return sub.lat, sub.lng, "address"
    return None, None, "city"


def compute_signals(sub: Submission) -> Dict[str, Any]:
    hits = 0
    for kw in ("amala","abula","gbegiri","ewedu","buka"):
        if kw in (sub.name or "").lower() or kw in (sub.address or "").lower():
            hits += 1
    return {
        "keyword_hits": hits,
        "has_photo": bool(sub.photo_url),
        "has_coords": sub.lat is not None and sub.lng is not None,
    }


def compute_score(signals: Dict[str, Any]) -> float:
    score = 0.0
    score += 0.35 if signals.get("keyword_hits", 0) >= 1 else 0.0
    score += 0.10 if signals.get("has_photo") else 0.0
    score += 0.10 if signals.get("has_coords") else 0.0
    return max(0.0, min(1.0, score))


# TODO: To add geohash bucket if lat/lng present
def make_dedupe_key(name: str | None, lat: float | None, lng: float | None) -> str:
    norm = (name or "").strip().lower()
    return f"name:{norm}"


def create_candidate_from_submission(sub: Submission) -> Candidate:
    lat, lng, precision = geocode_if_needed(sub)
    signals = compute_signals(sub)
    score   = compute_score(signals)

    candidate = Candidate.objects.create(
        name=sub.name,
        raw_address=sub.address or "",
        city=sub.city,
        country=sub.country or "Nigeria",
        lat=lat,
        lng=lng,
        price_band=sub.price_band or "",
        source_url="",
        source_kind="user",
        evidence=[{"kind": "user_submit", "photo_url": sub.photo_url}] if sub.photo_url else [],
        signals=signals,
        score=score,
        dedupe_key=make_dedupe_key(sub.name, lat, lng),
        geo_precision=precision,
        status="pending_verification",
    )
    return candidate