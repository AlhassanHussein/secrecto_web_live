from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.models.models import Friend, User
from app.schemas.schemas import FriendAdd, FriendResponse, UserResponse, UserSearch

router = APIRouter()


@router.post("/search", response_model=List[UserResponse])
async def search_users(
    search_data: UserSearch,
    db: Session = Depends(get_db)
) -> List[User]:
    # Search users by username (case-insensitive partial match)
    users = db.query(User).filter(
        User.username.ilike(f"%{search_data.username}%")
    ).limit(20).all()
    return users


@router.post("/friends/add", response_model=FriendResponse, status_code=status.HTTP_201_CREATED)
async def add_friend(
    friend_data: FriendAdd,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Friend:
    # Find friend by username
    friend = db.query(User).filter(User.username == friend_data.friend_username).first()
    if not friend:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if already friends
    existing_friendship = db.query(Friend).filter(
        Friend.user_id == current_user.id,
        Friend.friend_id == friend.id
    ).first()
    if existing_friendship:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already friends"
        )
    
    # Create friendship
    new_friendship = Friend(
        user_id=current_user.id,
        friend_id=friend.id
    )
    db.add(new_friendship)
    db.commit()
    db.refresh(new_friendship)
    
    return new_friendship


@router.get("/friends", response_model=List[UserResponse])
async def get_friends(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> List[User]:
    # Get all friends for current user
    friendships = db.query(Friend).filter(Friend.user_id == current_user.id).all()
    friend_ids = [f.friend_id for f in friendships]
    friends = db.query(User).filter(User.id.in_(friend_ids)).all()
    return friends
