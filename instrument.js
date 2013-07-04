Instrument = (function() {

"use strict";
var module = {};

var kFilterCount = 2;
var kOscillatorCount = 3;

////////////////////////////////////////////////////////////////////////////////
// LFO class
module.LFO = function(context) {
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
// EnvelopeContourer class

module.EnvelopeContourer = function(context, envelope, gainNode) {
  this.context_ = context;
  this.envelope_ = envelope;
  this.gainNode_ = gainNode;
}

module.EnvelopeContourer.prototype.contourOn = function(onTime) {
  var nextTime = this.context_.currentTime + onTime;
  this.gainNode_.gain.setValueAtTime(0, nextTime);
  nextTime += this.envelope_.attackDelay;
  this.gainNode_.gain.setValueAtTime(0, nextTime);
  nextTime += this.envelope_.attack;
  this.gainNode_.gain.linearRampToValueAtTime(1, nextTime);
  nextTime += this.envelope_.attackHold;
  this.gainNode_.gain.setValueAtTime(1, nextTime);
  nextTime += this.envelope_.decay;
  this.gainNode_.gain.linearRampToValueAtTime(this.envelope_.sustain, nextTime);
  this.sustainStart_ = nextTime;
}

module.EnvelopeContourer.prototype.contourOff = function(offTime) {
  var nextTime = this.context_.currentTime + offTime;
  if (nextTime < this.sustainStart_)
    nextTime = this.sustainStart_;
  nextTime += this.envelope_.sustainHold;
  this.gainNode_.gain.setValueAtTime(this.envelope_.sustain, nextTime);
  nextTime += this.envelope_.release;
  this.gainNode_.gain.linearRampToValueAtTime(0, nextTime);
}

module.EnvelopeContourer.prototype.contourFinishTime = function(offTime) {
  var releaseTime = offTime;
  if (this.sustainStart_ > releaseTime)
    releaseTime = this.sustainStart_;
  return releaseTime + this.envelope_.sustainHold + this.envelope_.release;
}

////////////////////////////////////////////////////////////////////////////////
// Envelope class

module.Envelope = function(context) {
  this.context_ = context;
  this.attackDelay = 0;
  this.attack = 0;
  this.attackHold = 0;
  this.decay = 0;
  this.sustain = 1;
  this.sustainHold = 0;
  this.release = 0;
}

module.Envelope.prototype.createNoteSection_ = function() {
  var gainNode = this.context_.createGainNode();
  var section = new PlayedNote.NoteSection(gainNode);
  section.addContour(new module.EnvelopeContourer(this.context_, this, gainNode));
  return section;
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

module.Oscillator.prototype.createNoteSection_ = function(octave, note) {
  var section = new PlayedNote.NoteSection(null);
  var oscillator = this.createOscillatorNode_(octave, note);
  section.pushOscillator(oscillator);
  if (this.vibrato.enabled) {
    this.vibrato.addNodes(oscillator.frequency, section);
  }
  if (this.tremolo.enabled) {
    gainNode = this.createTremoloNode_(section);
    section.pushNode(gainNode);
  }
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

module.Filter.prototype.createFilterNode_ = function(octave, note) {
  var frequency = ChromaticScale.frequencyForNote(octave, note) *
                  this.frequencyFactor;
  var filter = this.context_.createBiquadFilter();
  filter.type = this.type;
  filter.frequency.value = frequency;
  filter.Q.value = this.q;
  filter.gain.value = this.gain;
  return filter;
}

module.Filter.prototype.createNoteSection_ = function(octave, note) {
  var filterNode = this.createFilterNode_(octave, note);
  var filterSection = new PlayedNote.NoteSection(filterNode);
  if (this.lfo.enabled) {
    this.lfo.addNodes(filterNode.frequency, filterSection);
  }
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
  this.envelope = new module.Envelope(context);
}

// Public methods
module.Instrument.prototype.createPlayedNote = function(octave, note) {
  var playedNote = new PlayedNote.Note(this.context_, this.destinationNode_);
  var oscillatorSections = [];
  this.oscillators.forEach(function(oscillator) {
    oscillatorSections.push(oscillator.createNoteSection_(octave, note));
  });
  playedNote.pushSections(oscillatorSections);
  this.filters.forEach(function(filter) {
    if (filter.enabled) {
      var filterSection = filter.createNoteSection_(octave, note);
      playedNote.pushSections([filterSection]);
    }
  });
  playedNote.pushSections([this.envelope.createNoteSection_()]);
  return playedNote;
}

return module;

}());
