from datetime import datetime
from typing import Optional, List

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
    status: str = Field(..., pattern="^(inbox|public|deleted)$")


# ============ Link Schemas ============

class LinkCreate(BaseModel):
    display_name: Optional[str] = Field(None, max_length=100)
    expiration_option: str = Field(default="24h", pattern="^(6h|12h|24h|7d|30d|permanent)$")


class LinkResponse(BaseModel):
    public_id: str
    private_id: str
    display_name: Optional[str]
    expires_at: Optional[datetime]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class LinkPublicInfo(BaseModel):
    public_id: str
    display_name: Optional[str]
    expires_at: Optional[datetime]
    status: str

    class Config:
        from_attributes = True


class LinkMessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000)


class LinkMessageResponse(BaseModel):
    id: int
    content: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ============ User/Follow Schemas ============

class UserSearch(BaseModel):
    username: str = Field(..., min_length=1)


class UserPublicProfile(BaseModel):
    id: int
    username: str
    name: Optional[str]
    public_messages: List['MessageResponse']
    is_following: bool = False

    class Config:
        from_attributes = True


class FollowResponse(BaseModel):
    id: int
    follower_id: int
    following_id: int
    created_at: datetime

    class Config:
        from_attributes = True
