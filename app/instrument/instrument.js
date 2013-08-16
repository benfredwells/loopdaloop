Instrument = (function() {

"use strict";
var module = {};

// TODO: remove these constants, and let users add as many as they want.
var kFilterCount = 2;
var kOscillatorCount = 3;

////////////////////////////////////////////////////////////////////////////////
// Identifiers for waves
module.kSineWave = 'sine';
module.kSquareWave = 'square';
module.kSawtoothWave = 'sawtooth';
module.kTriangleWave = 'triangle';
module.kWaveTypes = [module.kSineWave, module.kSquareWave, module.kSawtoothWave, module.kTriangleWave];

////////////////////////////////////////////////////////////////////////////////
// Oscillator class
module.Oscillator = function(context) {
  this.context_ = context;
  this.enabledSetting = new Setting.Boolean();
  this.typeSetting = new Setting.Choice(module.kWaveTypes);
  this.octaveOffsetSetting = new Setting.Number(-4, 4);
  this.noteOffsetSetting = new Setting.Number(-8, 8);
  this.detuneSetting = new Setting.Number(-50, 50);
  this.gainContour = new Contour.ContouredValue(context, new Setting.Number(0, 1), false);
}

module.Oscillator.prototype.createOscillatorNode_ = function(octave, note) {
  var oscillator = this.context_.createOscillator();
  oscillator.frequency.value = Math.round(
      ChromaticScale.frequencyForNote(octave + this.octaveOffsetSetting.value,
                                      note + this.noteOffsetSetting.value));
  oscillator.detune.value = this.detuneSetting.value;
  oscillator.type = this.typeSetting.value;
  return oscillator;
}

module.Oscillator.prototype.createNoteSection_ = function(octave, note) {
  var section = new PlayedNote.NoteSection(null);
  var oscillator = this.createOscillatorNode_(octave, note);
  section.pushOscillator(oscillator);
  var gainNode = this.context_.createGainNode();
  section.pushNode(gainNode);
  var gainValueFunction = function(value) {
    return value;
  }
  this.gainContour.currentContour().addContour(gainValueFunction, gainNode.gain, section)
  return section;
}

////////////////////////////////////////////////////////////////////////////////
// Identifiers for filter types
module.kLowPassFilter = 'lowpass';
module.kHighPassFilter = 'highpass';
module.kFilterTypes = [module.kLowPassFilter, module.kHighPassFilter];

////////////////////////////////////////////////////////////////////////////////
// Filter class
module.Filter = function(context) {
  this.context_ = context;
  this.enabledSetting = new Setting.Boolean();
  this.typeSetting = new Setting.Choice(module.kFilterTypes);
  this.qSetting = new Setting.Number(0, 20);
  this.frequencyContour = new Contour.ContouredValue(context, new Setting.Number(0.5, 10), false);
}

module.Filter.prototype.createFilterNode_ = function(octave, note) {
  var filter = this.context_.createBiquadFilter();
  filter.type = this.typeSetting.value;
  filter.Q.value = this.qSetting.value;
  return filter;
}

module.Filter.prototype.createNoteSection_ = function(octave, note) {
  var filterNode = this.createFilterNode_(octave, note);
  var filterSection = new PlayedNote.NoteSection(filterNode);
  var noteFrequency = ChromaticScale.frequencyForNote(octave, note);
  var frequencyValueFunction = function(value) {
    return noteFrequency * value;
  }
  this.frequencyContour.currentContour().addContour(frequencyValueFunction, filterNode.frequency, filterSection)
  return filterSection;
}

module.Filter.prototype.getFrequencyResponse = function(octave, note, minHz, maxHz, steps) {
  var node = this.createFilterNode_(octave, note);
  // Set up buffers
  var response = {};
  response.frequencies = new Float32Array(steps);
  response.mag = new Float32Array(steps);
  response.phase = new Float32Array(steps);
  // Calculate frequencies
  var factor = Math.pow(maxHz / minHz, 1 / steps);
  var currentHz = minHz;
  response.noteFrequency = ChromaticScale.frequencyForNote(octave, note);
  var frequencyValueFunction = function(value) {
    return response.noteFrequency * (value);
  }
  response.filterFrequency = this.frequencyContour.currentContour().averageValue(frequencyValueFunction);
  node.frequency.value = response.filterFrequency;
  response.numHarmonics = 0;
  response.harmonics = [];
  response.filterIndex = 0;
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
  this.envelopeContour = new Contour.ContouredValue(context, new Setting.Number(0, 1), true);
  this.destinationNode_ = destinationNode;
  this.oscillators = [];
  for (var i = 0; i < kOscillatorCount; i++) {
    this.oscillators.push(new module.Oscillator(context));
  }
  this.filters = [];
  for (var i = 0; i < kFilterCount; i++) {
    this.filters.push(new module.Filter(context));
  }
}

module.Instrument.prototype.createEnvelope_ = function() {
  var gainNode = this.context_.createGainNode();
  var section = new PlayedNote.NoteSection(gainNode);
  var gainValueFunction = function(value) {
    return value;
  }
  this.envelopeContour.currentContour().addContour(gainValueFunction, gainNode.gain, section)
  return section;
}

// Public methods
module.Instrument.prototype.createPlayedNote = function(octave, note) {
  var playedNote = new PlayedNote.Note(this.context_, this.destinationNode_);
  var oscillatorSections = [];
  this.oscillators.forEach(function(oscillator) {
    if (oscillator.enabledSetting.value)
      oscillatorSections.push(oscillator.createNoteSection_(octave, note));
  });
  playedNote.pushSections(oscillatorSections);
  this.filters.forEach(function(filter) {
    if (filter.enabledSetting.value) {
      var filterSection = filter.createNoteSection_(octave, note);
      playedNote.pushSections([filterSection]);
    }
  });
  playedNote.pushSections([this.createEnvelope_()]);
  return playedNote;
}

return module;

}());