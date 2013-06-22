Instrument = (function() {

"use strict";
var module = {};

var kFilterCount = 2;
var kOscillatorCount = 3;

////////////////////////////////////////////////////////////////////////////////
// LFO class
module.LFO = function (context) {
  this.context_ = context;
  this.enabled = false;
  this.frequency = 0;
  this.gain = 0;
  this.phase = 0;
}

module.LFO.prototype.createController = function(param) {
  return gControllerManager.newLFO(param,
                                   this.frequency,
                                   this.phase,
                                   param.value,
                                   param.value * this.gain);
}

////////////////////////////////////////////////////////////////////////////////
// Oscillator class
module.Oscillator = function(context) {
  this.context_ = context;
  this.enabled = true;
  this.type = 'sine';
  this.vibrato = new module.LFO(context);
  this.tremolo = new module.LFO(context);
  this.octaveOffset = 0;
  this.noteOffset = 0;
  this.detune = 0;
}

module.Oscillator.prototype.createNode = function(octave, note, paramControllers) {
  var oscillator = this.context_.createOscillator();
  oscillator.frequency.value = Math.round(
      ChromaticScale.frequencyForNote(octave + this.octaveOffset,
                                      note + this.noteOffset));
  //oscillator.detune.value = this.detune;
  oscillator.type = this.type;
  console.log('Frequency is ' + oscillator.frequency.value);
  if (this.vibrato.enabled) {
    paramControllers.push(this.vibrato.createController(oscillator.frequency));
  }
  return oscillator;
}

module.Oscillator.prototype.createTremoloNode = function(paramControllers) {
  var gainNode = this.context_.createGainNode();
  paramControllers.push(this.tremolo.createController(gainNode.gain));
  return gainNode;
}

////////////////////////////////////////////////////////////////////////////////
// Filter class
module.Filter = function(context) {
  this.context_ = context;
  this.enabled = false;
  this.type = 'lowpass';
  this.frequencyFactor = 0;
  this.q = 0;
  this.gain = 0;
  this.lfo = new module.LFO(context);
}

module.Filter.prototype.createNode = function(octave, note, paramControllers) {
  var frequency = ChromaticScale.frequencyForNote(octave, note) *
                        this.frequencyFactor;
  var filter = this.context_.createBiquadFilter();
  filter.type = this.type;
  filter.frequency.value = frequency;
  filter.Q.value = this.q;
  filter.gain.value = this.gain;
  if (this.lfo.enabled && paramControllers) {
    paramControllers.push(this.lfo.createController(filter.frequency));
  }
  return filter;
}

module.Filter.prototype.getFrequencyResponse = function(octave, note, minHz, maxHz, steps) {
  var node = this.createNode(octave, note);
  // Set up buffers
  var response = {};
  response.frequencies = new Float32Array(steps);
  response.mag = new Float32Array(steps);
  response.phase = new Float32Array(steps);
  // Calculate frequencies
  var factor = Math.pow(maxHz / minHz, 1 / steps);
  var currentHz = minHz;
  response.noteFrequency = ChromaticScale.frequencyForNote(octave, note);
  response.filterFrequency = response.noteFrequency * this.frequencyFactor;
  response.numHarmonics = 0;
  response.harmonics = [];
  for (var i = 0; i < steps; ++i) {
    response.frequencies[i] = currentHz;
    currentHz = currentHz * factor;
    if (currentHz < response.noteFrequency)
      response.noteIndex = i;
    if (currentHz < response.filterFrequency)
      response.filterIndex = i;
    if (currentHz > (response.numHarmonics + 1) * response.noteFrequency) {
      response.harmonics.push(i - 1);
      response.numHarmonics++;
    }
  }
  node.getFrequencyResponse(response.frequencies, response.mag, response.phase);
  response.maxMag = 0;
  for (var i = 0; i < steps; ++i) {
    if (response.mag[i] > response.maxMag)
      response.maxMag = response.mag[i];
  }
  return response;
}

////////////////////////////////////////////////////////////////////////////////
// Instrument class

module.Instrument = function(context, destinationNode) {
  this.context_ = context;
  this.destinationNode_ = destinationNode;
  this.oscillators = [];
  for (var i = 0; i < kOscillatorCount; i++) {
    this.oscillators.push(new module.Oscillator(context));
  }
  this.filters = [];
  for (var i = 0; i < kFilterCount; i++) {
    this.filters.push(new module.Filter(context));
  }
  this.envelope = new PlayedNote.Envelope();
}

module.Instrument.prototype._addFilterNodes = function(filter, octave, note, allNodes, paramControllers, lastNodes) {
  if (filter.enabled) {
    var filterNode = filter.createNode(octave, note, paramControllers);
    allNodes.push(filterNode);
    lastNodes.forEach(function(lastNode) {
      lastNode.connect(filterNode);
    });
    return [filterNode];
  } else {
    return lastNodes;
  }
}

// Public methods
module.Instrument.prototype.createPlayedNote = function(octave, note) {
  var paramControllers = [];
  var oscillatorNodes = [];
  var oscillatorOutNodes = [];
  var gainNode = this.context_.createGainNode();
  var allNodes = [gainNode];
  this.oscillators.forEach(function(oscillator) {
    var oscillatorNode = oscillator.createNode(octave, note, paramControllers);
    allNodes.push(oscillatorNode);
    oscillatorNodes.push(oscillatorNode);
    var oscillatorOutNode = oscillatorNode;
    if (oscillator.tremolo.enabled) {
      oscillatorOutNode = oscillator.createTremoloNode(paramControllers);
      oscillatorNode.connect(oscillatorOutNode);
      allNodes.push(oscillatorOutNode);
    }
    oscillatorOutNodes.push(oscillatorOutNode);
  });
  // These should be in series, not parallel.
  var nextNodes = this._addFilterNodes(this.filters[0], octave, note, allNodes, paramControllers, oscillatorOutNodes);
  nextNodes.forEach(function(nextNode) {
    nextNode.connect(gainNode);
  });
  nextNodes = this._addFilterNodes(this.filters[1], octave, note, allNodes, paramControllers, oscillatorOutNodes);
  nextNodes.forEach(function(nextNode) {
    nextNode.connect(gainNode);
  });
  gainNode.connect(this.destinationNode_);
  return new PlayedNote.Note(this.context_, oscillatorNodes, gainNode, allNodes, this.envelope, paramControllers);
}

return module;

}());
