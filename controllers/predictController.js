// controllers/predictController.js
const { getModelInfo, predict } = require("../services/tfModelService");

// IMPORTAR MODELO MONGOOSE
const Prediction = require("../models/prediccion"); 

function health(req, res) {
  res.json({
    status: "ok",
    service: "predict"
  });
}

function ready(req, res) {
  const info = getModelInfo();

  if (!info.ready) {
    return res.status(503).json({
      ready: false,
      modelVersion: info.modelVersion,
      message: "Model is still loading"
    });
  }

  res.json({
    ready: true,
    modelVersion: info.modelVersion
  });
}

async function doPredict(req, res) {
  const start = Date.now();

  try {
    const info = getModelInfo();
    
    if (!info.ready) {
      return res.status(503).json({ error: "Model not ready", ready: false });
    }

    const { features, meta } = req.body;

  
    if (!features) return res.status(400).json({ error: "Missing features" });
    if (!meta || typeof meta !== "object") return res.status(400).json({ error: "Missing meta object" });

 
    if (meta.featureCount && meta.featureCount !== info.inputDim) {
      return res.status(400).json({
        error: `featureCount must be ${info.inputDim}, received ${meta.featureCount}`
      });
    }

    if (!Array.isArray(features) || features.length !== info.inputDim) {
      return res.status(400).json({
        error: `features must be an array of ${info.inputDim} numbers`
      });
    }

   
    const predictionValue = await predict(features);
    const latencyMs = Date.now() - start;
    
   
    const newPrediction = new Prediction({
        prediction: predictionValue,
        features: features,
        dataId: meta.dataId || null,
        latencyMs: latencyMs,
        timestamp: new Date()
    });

    
    const savedPrediction = await newPrediction.save();

    console.log(`[PREDICT] Guardado en Mongo con ID: ${savedPrediction._id}`);


    res.status(201).json({
      predictionId: savedPrediction._id, 
      prediction: predictionValue,
      timestamp: savedPrediction.timestamp,
      latencyMs
    });
    

  } catch (err) {
    console.error("Error en /predict:", err);
    res.status(500).json({ error: "Internal error: " + err.message });
  }
}

module.exports = {
  health,
  ready,
  doPredict
};
