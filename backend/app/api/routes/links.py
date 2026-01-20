from datetime import datetime, timedelta
from typing import List
import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user_optional, get_db
from app.models.models import Link, User
from app.schemas.schemas import LinkCreate, LinkResponse

router = APIRouter()


@router.get("/", response_model=List[LinkResponse])
async def list_links(
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
) -> List[Link]:
    # For now, return all non-expired links (in future, filter by user)
    now = datetime.utcnow()
    links = db.query(Link).filter(
        (Link.expiration_time == None) | (Link.expiration_time > now)
    ).all()
    return links


@router.post("/create", response_model=LinkResponse, status_code=status.HTTP_201_CREATED)
async def create_link(
    link_data: LinkCreate,
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
) -> Link:
    # Generate unique public and private link codes
    public_code = secrets.token_urlsafe(8)
    private_code = secrets.token_urlsafe(16)
    
    # Calculate expiration time
    expiration_time = None
    if link_data.expiration_minutes:
        expiration_time = datetime.utcnow() + timedelta(minutes=link_data.expiration_minutes)
    
    # Create link
    new_link = Link(
        temporary_name=link_data.temporary_name,
        public_link=f"/link/public/{public_code}",
        private_link=f"/link/private/{private_code}",
        expiration_time=expiration_time
    )
    db.add(new_link)
    db.commit()
    db.refresh(new_link)
    
    return new_link


@router.get("/get/{link_id}", response_model=LinkResponse)
async def get_link(link_id: int, db: Session = Depends(get_db)) -> Link:
    link = db.query(Link).filter(Link.id == link_id).first()
    if not link:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Link not found")
    
    # Check if expired
    if link.expiration_time and link.expiration_time < datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="Link has expired")
    
    return link
