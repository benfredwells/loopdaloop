Oscillator = (function() {

"use strict";
var module = {};

var gPeriodicWaves = {};

function createPeriodicWave(context, type) {
  var real = [];
  var imag = [];
  if (type == AudioConstants.kSineWave) {
    // Create sine waves with 90 degree phase (i.e. function is cos)
    real.push(0);
    real.push(1);
    imag.push(0);
    imag.push(0);
  }
  return context.createPeriodicWave(new Float32Array(real), new Float32Array(imag));
}

function getPeriodicWave(context, type) {
  var contextWaves = gPeriodicWaves[context];
  if (!contextWaves) {
    contextWaves = {};
    gPeriodicWaves[context] = contextWaves;
  }

  var wave = contextWaves[type];
  if (!wave) {
    wave = createPeriodicWave(context, type);
    contextWaves[type] = wave;
  }

  return wave;
}

function needsPeriodicWave(type) {
  return type == AudioConstants.kSineWave;
}

module.createNode = function(context, type) {
  var node = context.createOscillator();
  if (needsPeriodicWave(type)) {
    node.setPeriodicWave(getPeriodicWave(context, type));
    return node;
  }

  node.type = type;
  return node;
}

return module;

}());
