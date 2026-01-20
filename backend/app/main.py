from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, links, messages, users
from app.core.config import get_settings

settings = get_settings()
app = FastAPI(title="SayTruth API", version="0.1.0")

# CORS middleware to allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(messages.router, prefix="/api/messages", tags=["messages"])
app.include_router(links.router, prefix="/api/links", tags=["links"])
app.include_router(users.router, prefix="/api/users", tags=["users"])


@app.get("/health", tags=["health"])
async def health() -> dict:
    return {"status": "ok"}
