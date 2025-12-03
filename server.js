// server.js
// Entry point del servicio PREDICT

const express = require("express");
const path = require("path");
const predictRoutes = require("./routes/predictRoutes");
const { initModel } = require("./services/tfModelService");
const mongoose = require('mongoose');

const PORT = process.env.PORT || 3002;

const app = express();
app.use(express.json());

//CONECTAR MONGODB
mongoose.connect('mongodb://localhost:27017/prediccion_db')
  .then(() => {
      console.log('[MONGODB] Conexión a la base de datos establecida');
  })
  .catch(err => {
      console.error('[MONGODB] Error de conexión:', err);
  });

// Servir la carpeta del modelo TFJS (model/model.json + pesos)
const modelDir = path.resolve(__dirname, "model");
app.use("/model", express.static(modelDir));

// Rutas del servicio PREDICT
app.use("/", predictRoutes);

// Arranque del servidor + carga del modelo
app.listen(PORT, async () => {
  const serverUrl = `http://localhost:${PORT}`;
  console.log(`[PREDICT] Servicio escuchando en ${serverUrl}`);

  try {
    await initModel(serverUrl);
  } catch (err) {
    console.error("Error al inicializar modelo:", err);
    process.exit(1);
  }
});
