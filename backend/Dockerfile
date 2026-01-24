FROM python:3.15.0a5-slim-trixie


ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app/backend

# Combined update, upgrade (for security), and build dependencies
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
    curl=* \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
# If this still fails, we need to see the 'pip' error log specifically
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
