from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, validator

from app.core.config import settings
from app.database import get_db
from sqlalchemy.orm import Session

from app.models.user import User
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
)

router = APIRouter(prefix="/auth", tags=["auth"])

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

    @validator("password")
    def password_strength(cls, v: str) -> str:
        # Minimum 8 chars, at least one uppercase, one lowercase, one digit, one special char
        import re
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain an uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain a lowercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain a digit")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain a special character")
        return v

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int

def send_welcome_email(email: str, background: BackgroundTasks):
    # Simple placeholder – in real world configure SMTP settings in settings
    def _send():
        try:
            import smtplib
            from email.message import EmailMessage

            msg = EmailMessage()
            msg["Subject"] = "Welcome to the Recruitment Platform"
            msg["From"] = settings.SMTP_FROM_EMAIL
            msg["To"] = email
            msg.set_content(
                "Your account has been created successfully. Use your email and password to log in."
            )
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                if settings.SMTP_TLS:
                    server.starttls()
                if settings.SMTP_USER and settings.SMTP_PASSWORD:
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)
        except Exception as e:
            # Log error – for simplicity we ignore failures here
            pass

    background.add_task(_send)

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, background: BackgroundTasks, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    hashed = get_password_hash(user_in.password)
    new_user = User(
        email=user_in.email,
        hashed_password=hashed,
        full_name=user_in.full_name or "",
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    # send welcome email asynchronously
    send_welcome_email(new_user.email, background)
    access_token = create_access_token(data={"sub": str(new_user.id)})
    return Token(access_token=access_token, expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": str(user.id)})
    return Token(access_token=access_token, expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)
