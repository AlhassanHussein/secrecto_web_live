from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# ============ Auth Schemas ============

class UserSignup(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    name: Optional[str] = Field(None, max_length=100)  # Optional display name
    secret_phrase: str = Field(..., min_length=6)  # The hint/question
    secret_answer: str = Field(..., min_length=3)  # The answer to verify


class UserLogin(BaseModel):
    username: str
    secret_answer: str  # Login with answer, not the phrase


class PasswordRecovery(BaseModel):
    username: str


class PasswordRecoveryVerify(BaseModel):
    username: str
    secret_answer: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    username: str
    name: Optional[str]
    language: str
    created_at: datetime

    class Config:
        from_attributes = True


class UserSettingsUpdate(BaseModel):
    language: Optional[str] = Field(None, pattern="^(EN|AR|ES)$")
    secret_phrase: Optional[str] = Field(None, min_length=6)
    secret_answer: Optional[str] = Field(None, min_length=3)


# ============ Message Schemas ============

class MessageCreate(BaseModel):
    receiver_username: str
    content: str = Field(..., min_length=1, max_length=5000)


class MessageResponse(BaseModel):
    id: int
    receiver_id: int
    content: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class MessageStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(inbox|public|favorite)$")


# ============ Link Schemas ============

class LinkCreate(BaseModel):
    temporary_name: str = Field(..., min_length=1, max_length=100)
    expiration_minutes: Optional[int] = Field(default=60, ge=1, le=10080)  # Max 7 days


class LinkResponse(BaseModel):
    id: int
    temporary_name: str
    public_link: str
    private_link: str
    expiration_time: Optional[datetime]

    class Config:
        from_attributes = True


# ============ User/Friend Schemas ============

class UserSearch(BaseModel):
    username: str = Field(..., min_length=1)


class FriendAdd(BaseModel):
    friend_username: str


class FriendResponse(BaseModel):
    id: int
    user_id: int
    friend_id: int
    created_at: datetime

    class Config:
        from_attributes = True
