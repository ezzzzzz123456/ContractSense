FROM python:3.11-slim AS base
WORKDIR /app

# Install system dependencies for PyMuPDF, pdfplumber, Playwright
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libmupdf-dev \
    libfreetype6-dev \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright browsers
RUN playwright install chromium --with-deps

# App source
COPY app ./app

# ─── FastAPI service ──────────────────────────────────────────────────────────
FROM base AS api
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]

# ─── Celery worker ────────────────────────────────────────────────────────────
FROM base AS worker
CMD ["celery", "-A", "app.worker.celery_app", "worker", "--loglevel=info", "--concurrency=2"]
