from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_current_user_optional, get_db
from app.models.models import Message, MessageStatus, User
from app.schemas.schemas import MessageCreate, MessageResponse, MessageStatusUpdate

router = APIRouter()


@router.get("/", response_model=List[MessageResponse])
async def get_messages(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> List[Message]:
    # Get all messages for the current user
    messages = db.query(Message).filter(Message.receiver_id == current_user.id).all()
    return messages


@router.post("/send", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
) -> Message:
    # Find receiver by username
    receiver = db.query(User).filter(User.username == message_data.receiver_username).first()
    if not receiver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Receiver not found"
        )
    
    # Create message (anonymous if no current_user)
    new_message = Message(
        receiver_id=receiver.id,
        content=message_data.content,
        status=MessageStatus.inbox
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    
    return new_message


@router.patch("/{message_id}/status", response_model=MessageResponse)
async def update_message_status(
    message_id: int,
    status_update: MessageStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Message:
    # Find message
    message = db.query(Message).filter(Message.id == message_id).first()
    if not message:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    
    # Verify ownership
    if message.receiver_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    # Update status
    message.status = MessageStatus(status_update.status)
    db.commit()
    db.refresh(message)
    
    return message


@router.delete("/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_message(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> None:
    # Find message
    message = db.query(Message).filter(Message.id == message_id).first()
    if not message:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    
    # Verify ownership
    if message.receiver_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    # Delete message
    db.delete(message)
    db.commit()
