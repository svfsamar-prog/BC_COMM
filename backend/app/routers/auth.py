from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import User, AuditLog
from backend.app.schemas import LoginRequest, Token, UserCreate, UserOut
from backend.app.services.auth_service import verify_password, get_password_hash, create_access_token, get_current_user, require_admin

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == req.username).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    access_token = create_access_token(data={"sub": user.username, "role": user.role})
    
    # Audit log
    audit = AuditLog(username=user.username, action="USER_LOGIN", details=f"Role: {user.role}")
    db.add(audit)
    db.commit()

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "username": user.username,
        "allowed_states": user.allowed_states or [],
        "allowed_zones": user.allowed_zones or [],
    }

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/users", response_model=list[UserOut])
def list_users(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    return db.query(User).all()

@router.post("/users", response_model=UserOut)
def create_user(req: UserCreate, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username == req.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")

    new_user = User(
        username=req.username,
        hashed_password=get_password_hash(req.password),
        role=req.role,
        allowed_states=req.allowed_states,
        allowed_zones=req.allowed_zones,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
