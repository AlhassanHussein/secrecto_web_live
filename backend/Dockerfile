FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app/backend

# Fix: Combined apt-get commands, added version pinning, and cleaned up lists
# Pinning curl to a version common in python:3.11-slim (Debian Bookworm)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl=8.18.0 && \
    rm -rf /var/lib/apt/lists/*
    
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
