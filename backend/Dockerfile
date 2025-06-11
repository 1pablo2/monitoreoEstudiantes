FROM node:20.17

LABEL author="Pablo Molina <pablo.molina@alumnos.uv.cl>"

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json ./
COPY package-lock.json ./

RUN npm install

# Copiar el resto de la aplicación
COPY . .

EXPOSE 3001

CMD ["node", "app.js"]