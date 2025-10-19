"""Analytics-related endpoints."""
from __future__ import annotations

from fastapi import APIRouter

try:
    from src.analytics import AttendanceAnalytics
except ImportError:  # pragma: no cover - optional dependency
    AttendanceAnalytics = None  # type: ignore[assignment]


router = APIRouter(prefix="/analytics", tags=["analytics"])


def _analytics_missing_response() -> dict[str, str]:
    return {
        "error": "Analytics module not available. Install pandas: pip install pandas",
    }


@router.get("/dashboard")
def get_analytics_dashboard() -> dict[str, object]:
    """Return comprehensive analytics dashboard data."""
    if AttendanceAnalytics is None:
        return _analytics_missing_response()

    analytics = AttendanceAnalytics()
    return analytics.generate_report(days=30)


@router.get("/trends")
def get_attendance_trends(days: int = 90) -> dict[str, object]:
    """Return attendance trends for the specified period."""
    if AttendanceAnalytics is None:
        return _analytics_missing_response()

    analytics = AttendanceAnalytics()
    return analytics.get_attendance_trends(days)


@router.get("/export")
def export_analytics_report(format: str = "json") -> dict[str, object]:
    """Export analytics report to a file."""
    if AttendanceAnalytics is None:
        return _analytics_missing_response()

    analytics = AttendanceAnalytics()
    output_file = analytics.export_report(format=format)
    return {
        "message": "Analytics report exported successfully",
        "file_path": str(output_file),
        "format": format,
    }
