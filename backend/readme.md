# Backend - Monitoreo de Estudiantes (segpreg)

## Tecnologias
- Node.js 20 (imagen `node:20-slim`)
- Express
- Sequelize ORM
- MySQL
- Python 3
- Pandas, xlrd, openpyxl (librerías de Python)

## Instalacion local (sin Docker)
### Requisitos:

- Node.js 20+
- MySQL
- Python 3 con pip y las siguientes librerías:

```bash
pip install pandas openpyxl xlrd mysql-connector-python
```
### Pasos:
1 Instala dependencias:
```bash
npm install
```
2 Configura la conexión a la base de datos en src/db/config.js.

3 Inicia el servidor:

```bash
npm start
```

## Uso con docker
1. Construir
```bash
    docker compose build
```
2. Levantar los servicios
```bash
 docker compose up
```
3. Apagar los servicios
```bash
 docker compose down
```