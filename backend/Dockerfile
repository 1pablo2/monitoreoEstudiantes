FROM node:20-slim

LABEL author="Pablo Molina <pablo.molina@alumnos.uv.cl>"

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    gcc \
    libffi-dev \
    libssl-dev \
    build-essential \
    && apt-get clean

RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json ./
COPY package-lock.json ./

RUN npm install

# Copiar el resto de la aplicación
COPY . .

EXPOSE 8000

CMD ["node", "src/index.js"]