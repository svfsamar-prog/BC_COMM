import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.database import engine, Base, SessionLocal
from backend.app.models import User, StateAlias, Period
from backend.app.services.auth_service import get_password_hash
from backend.app.services.ingestion import DEFAULT_STATE_ALIASES, parse_and_validate_file, commit_monthly_dataset
from backend.app.routers import auth, upload, analytics, agents

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Sanjivani BC Commission Analytics API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(upload.router, prefix=settings.API_PREFIX)
app.include_router(analytics.router, prefix=settings.API_PREFIX)
app.include_router(agents.router, prefix=settings.API_PREFIX)

@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        # 1. Seed State Aliases
        for raw, canonical in DEFAULT_STATE_ALIASES.items():
            if not db.query(StateAlias).filter(StateAlias.raw_alias == raw).first():
                db.add(StateAlias(raw_alias=raw, canonical_state=canonical))
        db.commit()

        # 2. Seed Default Admin & Viewer Users
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            admin = User(
                username="admin",
                hashed_password=get_password_hash("admin123"),
                role="admin",
                allowed_states=[],
                allowed_zones=[],
            )
            db.add(admin)

        viewer_user = db.query(User).filter(User.username == "viewer").first()
        if not viewer_user:
            viewer = User(
                username="viewer",
                hashed_password=get_password_hash("viewer123"),
                role="viewer",
                allowed_states=[],
                allowed_zones=[],
            )
            db.add(viewer)

        db.commit()

        # 3. Seed August 2026 Sample File if database has no periods
        if db.query(Period).count() == 0:
            sample_path = r"c:\Users\Samar Raj\Desktop\bc comm\SANJIVANI COMMISSION AUGUST 2026.xlsx"
            if os.path.exists(sample_path):
                print(f"[STARTUP] Ingesting initial master dataset: {sample_path}")
                with open(sample_path, "rb") as f:
                    file_bytes = f.read()
                df, report = parse_and_validate_file(
                    file_bytes=file_bytes,
                    filename="SANJIVANI COMMISSION AUGUST 2026.xlsx",
                    month=8,
                    year=2026,
                    days_in_month=31,
                    db=db,
                )
                commit_monthly_dataset(
                    df=df,
                    month_year="AUGUST 2026",
                    year=2026,
                    month=8,
                    days_in_month=31,
                    uploaded_by="admin",
                    db=db,
                )
                print(f"[STARTUP] Ingested August 2026 dataset: {report['summary']}")

    finally:
        db.close()

@app.get("/")
def root():
    return {
        "app": "Sanjivani BC Commission Analytics API",
        "status": "healthy",
        "version": "1.0.0",
        "docs": "/docs",
    }

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "Sanjivani API"}

