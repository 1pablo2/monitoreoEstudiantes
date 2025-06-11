import app from './app.js';

const main = (() => {
    const server = app.listen(4000)
    console.log("Servidor activo")
    server.timeout = 60000;
})();