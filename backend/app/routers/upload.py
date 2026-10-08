import pandas as pd
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import User, Period
from backend.app.services.auth_service import require_admin
from backend.app.services.ingestion import parse_and_validate_file, commit_monthly_dataset
from backend.app.schemas import PreValidationReport

router = APIRouter(prefix="/upload", tags=["Upload & Ingestion"])

# Temporary in-memory cache for validated file awaiting confirmation
UPLOAD_STAGE_CACHE = {}

@router.post("/validate", response_model=PreValidationReport)
async def validate_upload(
    file: UploadFile = File(...),
    month: int = Form(...),
    year: int = Form(...),
    days_in_month: int = Form(31),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty file uploaded")

    df, report = parse_and_validate_file(
        file_bytes=contents,
        filename=file.filename,
        month=month,
        year=year,
        days_in_month=days_in_month,
        db=db,
    )

    cache_key = f"{admin.username}_{year}_{month}"
    UPLOAD_STAGE_CACHE[cache_key] = {
        "df": df,
        "month_year": report["period_label"],
        "year": year,
        "month": month,
        "days_in_month": days_in_month,
    }

    return report

@router.post("/confirm")
def confirm_upload(
    month: int = Form(...),
    year: int = Form(...),
    days_in_month: int = Form(31),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    cache_key = f"{admin.username}_{year}_{month}"
    if cache_key not in UPLOAD_STAGE_CACHE:
        raise HTTPException(status_code=400, detail="No validated upload found in stage. Please validate the file first.")

    staged = UPLOAD_STAGE_CACHE.pop(cache_key)
    result = commit_monthly_dataset(
        df=staged["df"],
        month_year=staged["month_year"],
        year=year,
        month=month,
        days_in_month=days_in_month,
        uploaded_by=admin.username,
        db=db,
    )

    return result

@router.get("/periods")
def list_periods(db: Session = Depends(get_db)):
    periods = db.query(Period).order_by(Period.year.desc(), Period.month.desc()).all()
    return [
        {
            "monthYear": p.month_year,
            "year": p.year,
            "month": p.month,
            "calendarDays": p.calendar_days,
            "uploadedBy": p.uploaded_by,
            "uploadedAt": p.uploaded_at.isoformat() if p.uploaded_at else "",
            "rowsCount": p.rows_count,
        }
        for p in periods
    ]
