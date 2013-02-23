Instrument = (function() {

"use strict";
var module = {};

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
  this.type = 'sine';
  this.vibrato = new module.LFO(context);
  this.tremolo = new module.LFO(context);
}

module.Oscillator.prototype.createNode = function(octave, note, paramControllers) {
  var oscillator = this.context_.createOscillator();
  oscillator.frequency.value = ChromaticScale.frequencyForNote(octave, note);
  oscillator.type = this.type;
  if (this.vibrato.enabled) {
    paramControllers.push(this.vibrato.createController(oscillator.frequency));
  }
  return oscillator;
}

module.Oscillator.prototype.createTremoloNode = function(paramControllers) {
  var gainNode = this.context_.createGainNode();
//  gainNode.gain.value = 1;
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

module.Filter.prototype.getFrequencyResponse = function(minHz, maxHz, steps) {
  // For purposes of getting frequency response, assume middle C.
  var octave = 4;
  var note = 0;
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
  for (var i = 0; i < steps; ++i) {
    response.frequencies[i] = currentHz;
    currentHz = currentHz * factor;
    if (currentHz < response.noteFrequency)
      response.noteIndex = i;
    if (currentHz < response.filterFrequency)
      response.filterIndex = i;
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
  this.oscillator = new module.Oscillator(context);
  this.filter = new module.Filter(context);
  this.envelope = new PlayedNote.Envelope();
  console.log(this.envelope);
}

module.Instrument.prototype._addFilterNodes = function(filter, octave, note, allNodes, paramControllers, lastNode) {
  if (filter.enabled) {
    var filterNode = filter.createNode(octave, note, paramControllers);
    allNodes.push(filterNode);
    lastNode.connect(filterNode);
    return filterNode;
  } else {
    return lastNode;
  }
}

// Public methods
module.Instrument.prototype.createPlayedNote = function(octave, note) {
  var paramControllers = [];
  var oscillator = this.oscillator.createNode(octave, note, paramControllers);
  var gainNode = this.context_.createGainNode();
  var allNodes = [oscillator, gainNode];
  var oscillatorOut = oscillator;
  if (this.oscillator.tremolo.enabled) {
    oscillatorOut = this.oscillator.createTremoloNode(paramControllers);
    oscillator.connect(oscillatorOut);
    allNodes.push(oscillatorOut);
  }
  var nextNode = this._addFilterNodes(this.filter, octave, note, allNodes, paramControllers, oscillatorOut);
  nextNode.connect(gainNode);
  gainNode.connect(this.destinationNode_);
  console.log(this.envelope);
  return new PlayedNote.Note(this.context_, [oscillator], gainNode, allNodes, this.envelope, paramControllers);
}

return module;

}());
