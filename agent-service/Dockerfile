FROM python:3.11-slim-bookworm

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose the port (LiveKit agents usually don't listen on HTTP for traffic, but for health checks if needed)
# However, this agent connects OUTBOUND to LiveKit Cloud via WebSocket.
# Cloud Run needs to listen on $PORT for health checks?
# LiveKit Agent SDK starts a local HTTP server for health checks on a random port or configurable.
# We should ensure it binds to $PORT if we want Cloud Run health checks to pass.
# The default agent runner usually handles this provided we set the right env vars.

CMD ["python", "main.py", "start"]
