FROM ubuntu:22.04

ENV PORT=8000
ENV PYTHONPATH=/app/backend
ENV NODE_VERSION=20

WORKDIR /app

RUN apt-get update && apt-get install -y \
    g++ \
    build-essential \
    python3 \
    python3-pip \
    python3-dev \
    libstdc++6 \
    curl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash

ENV NVM_DIR=/root/.nvm
RUN . $NVM_DIR/nvm.sh && nvm install 20 && nvm use 20

COPY backend/requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY backend /app/backend
COPY prisma /app/prisma

WORKDIR /app/prisma
RUN prisma generate --schema=./schema.prisma

WORKDIR /app/backend

EXPOSE 8000
CMD ["python3", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
