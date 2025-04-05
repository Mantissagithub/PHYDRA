FROM ubuntu:22.04

ENV PORT=8000
ENV PYTHONPATH=/app


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





COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt 

COPY . /app/

RUN prisma generate  --schema=prisma/schema.prisma



EXPOSE ${PORT}

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT}/ || exit 1



CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]