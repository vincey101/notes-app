# Use Python slim image for smaller size
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PIP_DEFAULT_TIMEOUT=100 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1 \
    PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc python3-dev && \
    rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install dependencies with increased timeout
RUN pip install --no-cache-dir --timeout 100 -r requirements.txt && \
    apt-get purge -y gcc python3-dev && \
    apt-get autoremove -y

# Copy the application and environment files
COPY app/ ./app/
COPY .env .

# Create a non-root user
RUN useradd -m appuser && chown -R appuser /app
USER appuser

# Set the working directory to where the app is
WORKDIR /app/app

# Expose port
EXPOSE 5000

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"] 