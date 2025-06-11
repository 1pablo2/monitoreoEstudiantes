import morgan from "morgan";
import express from "express";
import { syncDatabase } from "./db/config.js";
import rutaCargarArchivos from "./routes/cargarArchivos.js";
import rutaMatriculado from "./routes/matriculado.js";
import rutaFecgaActu from "./routes/fechaActualizacion.js"
import rutaPlanEstudios from "./routes/planEstudios.js";
import rutaAsignatura from "./routes/asignatura.js";

import cors from "cors";

const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'DELETE'],
}));

app.set("env", "development");
app.set("port", 8000);

app.use(morgan("dev"));
app.use(express.json({ limit: "50MB" }));
app.use(express.urlencoded({ extended: true }));

app.use("/cargarArchivos", rutaCargarArchivos);
app.use("/fechaActualizacion", rutaFecgaActu);
app.use("/matriculado", rutaMatriculado);
app.use("/planestudios", rutaPlanEstudios);
app.use("/asignaturas", rutaAsignatura);

syncDatabase()
  .then(() => {
    console.log("Database synced");
    app.listen(app.get("port"), () => {
      console.log(
        `Server running in ${app.get("env")} mode on port ${app.get("port")}`
      );
    });
  })
  .catch((err) => {
    console.error("Error al sincronizar la base de datos:", err);
    process.exit(1);
  });

export default app;