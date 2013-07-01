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
}

module.LFO.prototype.addNodes = function(param, noteSection) {
  var oscillator = this.context_.createOscillator();
  oscillator.type = 'sine';
  oscillator.frequency.value = this.frequency;
  noteSection.oscillatorNodes.push(oscillator);
  noteSection.allNodes.push(oscillator);
  var gain = this.context_.createGainNode();
  gain.gain.value = param.value * this.gain;
  noteSection.allNodes.push(gain);
  oscillator.connect(gain);
  gain.connect(param);
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
  this.gain = 1;
}

module.Oscillator.prototype.createTremoloNode_ = function(noteSection) {
  var gainNode = this.context_.createGainNode();
  this.tremolo.addNodes(gainNode.gain, noteSection);
  return gainNode;
}

module.Oscillator.prototype.createOscillatorNode_ = function(octave, note) {
  var oscillator = this.context_.createOscillator();
  oscillator.frequency.value = Math.round(
      ChromaticScale.frequencyForNote(octave + this.octaveOffset,
                                      note + this.noteOffset));
  oscillator.detune.value = this.detune;
  oscillator.type = this.type;
  return oscillator;
}

module.Oscillator.prototype.createNoteSection_ = function(octave, note, playedNote) {
  var section = new PlayedNote.NoteSection();
  var oscillator = this.createOscillatorNode_(octave, note);
  section.pushNode(oscillator, true);
  if (this.vibrato.enabled) {
    this.vibrato.addNodes(oscillator.frequency, section);
  }
  if (this.tremolo.enabled) {
    gainNode = this.createTremoloNode_(section);
    section.pushNode(gainNode, false);
  }
  playedNote.sections.push(section);
  return section;
}

////////////////////////////////////////////////////////////////////////////////
// Filter class
module.Filter = function(context) {
  this.context_ = context;
  this.enabled = false;
  this.type = 'lowpass';
  this.frequencyFactor = 0;
  this.q = 0;
  this.lfo = new module.LFO(context);
}

module.Filter.prototype.createNode_ = function(octave, note, noteSection) {
  var frequency = ChromaticScale.frequencyForNote(octave, note) *
                        this.frequencyFactor;
  var filter = this.context_.createBiquadFilter();
  filter.type = this.type;
  filter.frequency.value = frequency;
  filter.Q.value = this.q;
  filter.gain.value = this.gain;
  if (this.lfo.enabled && noteSection) {
    this.lfo.addNodes(filter.frequency, noteSection);
  }
  return filter;
}

module.Filter.prototype.getFrequencyResponse = function(octave, note, minHz, maxHz, steps) {
  var node = this.createNode_(octave, note, null);
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

// Public methods
module.Instrument.prototype.createPlayedNote = function(octave, note) {
  var playedNote = new PlayedNote.Note(this.context_, this.envelope);
  var currentSections = [];
  playedNote.gainNode = this.context_.createGainNode();
  this.oscillators.forEach(function(oscillator) {
    currentSections.push(oscillator.createNoteSection_(octave, note, playedNote));
  });
  this.filters.forEach(function(filter) {
    if (filter.enabled) {
      var filterSection = new PlayedNote.NoteSection();
      var filterNode = filter.createNode_(octave, note, filterSection);
      filterSection.pushNode(filterNode, false);
      currentSections.forEach(function(section) {
        section.connect(filterSection);
      });
      playedNote.sections.push(filterSection);
      currentSections = [filterSection];
    }
  });
  currentSections.forEach(function(section) {
    section.outputNode.connect(playedNote.gainNode);
  });
  playedNote.gainNode.connect(this.destinationNode_);
  return playedNote;
}

return module;

}());
