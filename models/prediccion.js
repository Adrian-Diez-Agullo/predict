'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Definimos qué forma tiene una predicción en la base de datos
const PredictionSchema = new Schema({
    timestamp: { type: Date, default: Date.now }, // Cuándo ocurrió
    prediction: { type: Number, required: true }, // El valor predicho (ej: 45.3)
    features: { type: [Number], required: true }, // Los 7 números de entrada
    dataId: String,                               // El ID del dato original (si nos lo pasan)
    latencyMs: Number                             // Cuánto tardamos en calcularlo
});

module.exports = mongoose.model('Prediction', PredictionSchema);