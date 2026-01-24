FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app/backend

COPY requirements.txt ./
# Fixed: Removed --no-install-recommends from pip (it's not a pip flag)
RUN pip install --no-cache-dir -r requirements.txt

# Fixed: Added --no-install-recommends here to resolve DL3015
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

COPY app ./app
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
