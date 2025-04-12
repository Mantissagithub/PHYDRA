FROM ubuntu:22.04

ENV PORT=8000
ENV PYTHONPATH=/app/backend
ENV NODE_VERSION=20

WORKDIR /app

# Install required dependencies
RUN apt-get update && apt-get install -y \
    g++ \
    build-essential \
    python3 \
    python3-pip \
    python3-dev \
    libstdc++6 \
    curl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install NVM
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash

# Activate NVM
ENV NVM_DIR=/root/.nvm
RUN . $NVM_DIR/nvm.sh

# Use Node.js version 20
RUN . $NVM_DIR/nvm.sh && nvm install 20 && nvm use 20

# Copy requirements and install Python dependencies
COPY backend/requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt 

COPY backend /app/backend
COPY prisma /app/prisma

# Generate Prisma client
RUN prisma generate --schema=prisma/schema.prisma

# Expose the application port
EXPOSE 8000

# # Add a health check to ensure the app is running
# HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
#     CMD curl -f http://localhost:${PORT}/ || exit 1

# Run the FastAPI server using Uvicorn
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
CMD ["python3", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]