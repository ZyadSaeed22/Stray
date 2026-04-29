const path = require('path');
const fs   = require('fs');

const MODELS_DIR = path.join(__dirname, 'face-models');
const THRESHOLD  = 0.55;
const AUTO_RESOLVE_THRESHOLD = 0.40;

let faceapi      = null;
let modelsLoaded = false;

function init() {
  if (faceapi) return;
  faceapi = require('face-api.js');
  const { Canvas, Image, ImageData } = require('canvas');
  faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
}

async function ensureModels() {
  if (modelsLoaded) return;
  init();

  if (!fs.existsSync(MODELS_DIR)) {
    throw new Error(`face-api models not found at ${MODELS_DIR}.`);
  }

  const nets = faceapi.nets;
  await nets.ssdMobilenetv1.loadFromDisk(MODELS_DIR);
  await nets.faceLandmark68Net.loadFromDisk(MODELS_DIR);
  await nets.faceRecognitionNet.loadFromDisk(MODELS_DIR);

  modelsLoaded = true;
  console.log('✅  face-api models loaded');
}

async function extractDescriptor(imagePath) {
  await ensureModels();
  const { loadImage } = require('canvas');

  const img       = await loadImage(imagePath);
  const detection = await faceapi
    .detectSingleFace(img)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) throw new Error('No face detected in image');
  return Array.from(detection.descriptor);
}

function compareDescriptors(a, b) {
  if (!a?.length || !b?.length) return Infinity;
  return faceapi.euclideanDistance(new Float32Array(a), new Float32Array(b));
}

function findMatches(targetDescriptor, reports, threshold = THRESHOLD) {
  const hits = [];

  for (const report of reports) {
    if (!report.faceDescriptor?.length) continue;
    const distance   = compareDescriptors(targetDescriptor, report.faceDescriptor);
    const similarity = Math.round((1 - distance) * 100);
    if (distance <= threshold) hits.push({ report, distance, similarity });
  }

  return hits.sort((a, b) => a.distance - b.distance);
}

module.exports = {
  extractDescriptor,
  compareDescriptors,
  findMatches,
  THRESHOLD,
  AUTO_RESOLVE_THRESHOLD,
};