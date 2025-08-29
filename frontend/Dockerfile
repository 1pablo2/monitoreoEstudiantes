FROM node:20-slim
LABEL author="Pablo Molina <pablo.molina@alumnos.uv.cl>"
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
EXPOSE 3000
CMD ["npm","start"]