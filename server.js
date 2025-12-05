// server.js
// Entry point del servicio PREDICT

require("dotenv").config();

const express = require("express");
const path = require("path");
const predictRoutes = require("./routes/predictRoutes");
const { initModel } = require("./services/tfModelService");
const mongoose = require('mongoose');

const PORT = process.env.PORT || 3002;
const MODEL_VERSION = process.env.MODEL_VERSION || "v1.0";

const app = express();
app.use(express.json());

//CONECTAR MONGODB

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/prediccion_db';

console.log(`[SERVER] Conectando a: ${mongoUri}`); // Log para ver qué está pasando

mongoose.connect(mongoUri)
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
