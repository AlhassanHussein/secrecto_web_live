FROM python:3.12-slim
# Metadata
LABEL maintainer="python.hassan@gmail.com" \
      description="SayTruth Backend API" \
      version="1.0"

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app/backend
# Install system dependencies

# hadolint ignore=DL3008
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd -r appuser && \
    useradd -r -g appuser -u 1001 appuser

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=appuser:appuser app ./app

USER appuser

EXPOSE 8000


HEALTHCHECK CMD curl -f http://localhost:8000/health || exit 1
# Start the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
