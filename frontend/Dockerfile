FROM node:20-slim

LABEL author="Pablo Molina <pablo.molina@alumnos.uv.cl>"

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json ./
COPY package-lock.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

EXPOSE 3000

CMD ["npm", "start"]