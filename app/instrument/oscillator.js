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

module.oscillatorValue = function(type, frequency, time) {
  var periods = time * frequency;
  var periodOffset = periods - Math.floor(periods);
  var oscillation = 0;
  switch (type) {
   case AudioConstants.kSineWave:
    oscillation = Math.cos(2 * Math.PI * periodOffset);
    break;
   case AudioConstants.kSquareWave:
    if (periodOffset < 0.5)
      oscillation = 1
    else
      oscillation = -1;
    break;
   case AudioConstants.kSawtoothWave:
    if (periodOffset < 0.5)
      oscillation = 2 * periodOffset
    else
      oscillation = 2 * (periodOffset - 1);
    break;
   case AudioConstants.kTriangleWave:
    if (periodOffset < 0.25)
      oscillation = 4 * periodOffset
    else if (periodOffset < 0.75)
      oscillation = 1 - 4 * (periodOffset - 0.25);
    else
      oscillation = 4 * (periodOffset - 1)
    break;
  }
  return oscillation;
}

return module;

}());
