FROM node:20-slim
LABEL author="Pablo Molina <pablo.molina@alumnos.uv.cl>"
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 python3-pip python3-venv python-is-python3 \
 && rm -rf /var/lib/apt/lists/*

RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt   # <- ahora dentro del venv, sin PEP 668

COPY . .

EXPOSE 8000
CMD ["npm","run","dev"]