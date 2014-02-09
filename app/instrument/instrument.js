Instrument = (function() {

"use strict";
var module = {};

var kFilterCount = 2;
var kOscillatorCount = 3;

////////////////////////////////////////////////////////////////////////////////
// Pitch class
module.Pitch = function() {
  Setting.ListenableGroup.call(this);
  this.unitsSetting = this.addListenable(new Setting.Choice(AudioConstants.kPitchUnits));
  this.contour = this.addListenable(new Contour.ContouredValue(new Setting.Number(-1, 1), false));
}

module.Pitch.prototype = Object.create(Setting.ListenableGroup.prototype);

////////////////////////////////////////////////////////////////////////////////
// Oscillator class
module.Oscillator = function() {
  Setting.ListenableGroup.call(this);
  this.enabledSetting = this.addListenable(new Setting.Boolean());
  this.typeSetting = this.addListenable(new Setting.Choice(AudioConstants.kWaveTypes));
  this.octaveOffsetSetting = this.addListenable(new Setting.Number(-4, 4));
  this.noteOffsetSetting = this.addListenable(new Setting.Number(-8, 8));
  this.detuneSetting = this.addListenable(new Setting.Number(-50, 50));
  this.gainContour = this.addListenable(new Contour.ContouredValue(new Setting.Number(0, 1), false));
}

module.Oscillator.prototype = Object.create(Setting.ListenableGroup.prototype);

module.Oscillator.prototype.createOscillatorNode_ = function(context, octave, note) {
  var node = Oscillator.createNode(context, this.typeSetting.value);
  node.frequency.value = ChromaticScale.frequencyForNote(octave + this.octaveOffsetSetting.value,
                                                         note + this.noteOffsetSetting.value);
  return node;
}

module.Oscillator.prototype.createNoteSection_ = function(context, octave, note, pitch) {
  var section = new PlayedNote.NoteSection(null);
  var oscillatorNode = this.createOscillatorNode_(context, octave, note);
  section.pushOscillator(oscillatorNode);
  var gainNode = context.createGainNode();
  section.pushNode(gainNode);
  var oscillator = this;
  var detuneValueFunction = function(value) {
    var multiplier = 100;
    if (pitch.unitsSetting.value == AudioConstants.kOctaves)
      multiplier = 1200;

    return oscillator.detuneSetting.value + value * multiplier;
  }
  pitch.contour.currentContour().addContour(context, detuneValueFunction, oscillatorNode.detune, section);
  var gainValueFunction = function(value) {
    return value;
  }
  this.gainContour.currentContour().addContour(context, gainValueFunction, gainNode.gain, section)
  return section;
}

////////////////////////////////////////////////////////////////////////////////
// Filter class
module.Filter = function() {
  Setting.ListenableGroup.call(this);
  this.enabledSetting = this.addListenable(new Setting.Boolean());
  this.typeSetting = this.addListenable(new Setting.Choice(AudioConstants.kFilterTypes));
  this.orderSetting = this.addListenable(new Setting.Choice(AudioConstants.kFilterOrders));
  this.qSetting = this.addListenable(new Setting.Number(0, 20));
  this.frequencyContour = this.addListenable(new Contour.ContouredValue(new Setting.Number(0.5, 10), false));
}

module.Filter.prototype = Object.create(Setting.ListenableGroup.prototype);

module.Filter.prototype.createFilterNode_ = function(context, octave, note) {
  var filter = context.createBiquadFilter();
  filter.type = this.typeSetting.value;
  filter.Q.value = this.qSetting.value;
  return filter;
}

module.Filter.prototype.createNoteSection_ = function(context, octave, note) {
  var noteFrequency = ChromaticScale.frequencyForNote(octave, note);
  var frequencyValueFunction = function(value) {
    return noteFrequency * value;
  }

  var filterNode = this.createFilterNode_(context, octave, note);
  var filterSection = new PlayedNote.NoteSection(filterNode);
  this.frequencyContour.currentContour().addContour(context, frequencyValueFunction, filterNode.frequency, filterSection);

  for (var i=1; i<AudioConstants.kFilterOrderNodes[this.orderSetting.value]; i++) {
    filterNode = this.createFilterNode_(context, octave, note);
    filterSection.pushNode(filterNode);
    this.frequencyContour.currentContour().addContour(context, frequencyValueFunction, filterNode.frequency, filterSection);
  }
  return filterSection;
}

module.Filter.prototype.getFrequencyResponse = function(context, octave, note, time, noteOnTime, harmonics, steps) {
  var node = this.createFilterNode_(context, octave, note);
  // Set up buffers
  var response = {};
  response.frequencies = new Float32Array(steps);
  response.mag = new Float32Array(steps);
  response.phase = new Float32Array(steps);
  var noteFrequency = ChromaticScale.frequencyForNote(octave, note);
  response.filterFrequency = noteFrequency * this.frequencyContour.valueAtTime(time, noteOnTime);
  node.frequency.value = response.filterFrequency;
  var maxHz = noteFrequency * harmonics;
  var nodes = AudioConstants.kFilterOrderNodes[this.orderSetting.value];
  for (var i = 0; i < steps; ++i) {
    response.frequencies[i] = maxHz * i / steps;
  }
  node.getFrequencyResponse(response.frequencies, response.mag, response.phase);
  for (var i = 0; i < steps; ++i) {
    response.mag[i] = Math.pow(response.mag[i], nodes);
    response.phase[i] = response.phase[i] * nodes;
  }
  return response;
}

////////////////////////////////////////////////////////////////////////////////
// Instrument class
module.Instrument = function() {
  Setting.ListenableGroup.call(this);
  this.pitch = this.addListenable(new module.Pitch());
  this.envelopeContour = this.addListenable(new Contour.ContouredValue(new Setting.Number(0, 1), true));
  this.oscillators = [];
  for (var i = 0; i < kOscillatorCount; i++) {
    this.oscillators.push(this.addListenable(new module.Oscillator()));
  }
  this.filters = [];
  for (var i = 0; i < kFilterCount; i++) {
    this.filters.push(this.addListenable(new module.Filter()));
  }
}

module.Instrument.prototype = Object.create(Setting.ListenableGroup.prototype);

module.Instrument.prototype.createEnvelope_ = function(context) {
  var gainNode = context.createGainNode();
  var section = new PlayedNote.NoteSection(gainNode);
  var gainValueFunction = function(value) {
    return value;
  }
  this.envelopeContour.currentContour().addContour(context, gainValueFunction, gainNode.gain, section)
  return section;
}

module.Instrument.prototype.createPlayedNote = function(scene, octave, note) {
  var playedNote = new PlayedNote.Note(scene);
  var instrument = this;
  var oscillatorSections = [];
  this.oscillators.forEach(function(oscillator) {
    if (oscillator.enabledSetting.value)
      oscillatorSections.push(oscillator.createNoteSection_(scene.context, octave, note, instrument.pitch));
  });
  playedNote.pushSections(oscillatorSections);
  this.filters.forEach(function(filter) {
    if (filter.enabledSetting.value) {
      var filterSection = filter.createNoteSection_(scene.context, octave, note);
      playedNote.pushSections([filterSection]);
    }
  });
  playedNote.pushSections([this.createEnvelope_(scene.context)]);
  return playedNote;
}

return module;

}());
