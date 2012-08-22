var gContext = null;
var gCurrentNote = null;
var gControllerManager = null;

////////////////////////////////////////////////////////////////////////////////
// Oscillator constants
var gWaveTypes = ['SINE', 'SQUARE', 'SAWTOOTH', 'TRIANGLE'];

////////////////////////////////////////////////////////////////////////////////
// Filter constants
var gFilterTypes = ['LOWPASS', 'HIGHPASS', 'BANDPASS', 'LOWSHELF', 'HIGHSHELF',
                    'PEAKING', 'NOTCH', 'ALLPASS'];
var gFilterHasGain = [false, false, false, true, true, true, false, false];
var gFilterFrequencyFactors = [0.5, 0.707, 1, 1.414, 2, 2.828];

////////////////////////////////////////////////////////////////////////////////
// LFO constants
var gMaxLFOFrequencyRangeValue = 100;
var gLFOFrequencyExponentFactor = 1/25;
var gMaxLFOGainRangeValue = 100;
var gMaxLFOPhaseRangeValue = 36;

// Todo:
// Hide things in anon functions
// Play notes on keyboard
//   Separate instrument from note
//   Hook up to keys :)
//   Fancy keyboard display
// Affect pitch with LFO
// Affect volume with LFO
// ADSR envelope
// Option to have filter cutoff not related to pitch
// Multiple filters
// Looping!

////////////////////////////////////////////////////////////////////////////////
// The Note class
function Note(context,
              outputNode,
              frequency,
              waveType,
              filterEnabled,
              filterType,
              filterFrequency,
              filterQ,
              filterGain,
              filterLFOEnabled,
              filterLFOFrequency,
              filterLFOGain,
              filterLFOPhase) {
  this.context_ = context;
  this.oscillatorNode_ = this.context_.createOscillator();
  this.oscillatorNode_.frequency.value = frequency;
  this.oscillatorNode_.type = waveType;
  this.gainNode_ = this.context_.createGainNode();
  this.gainNode_.gain.setValueAtTime(0, this.context_.currentTime);
  this.gainNode_.gain.setTargetValueAtTime(1, this.context_.currentTime, 0.1);
  this.filterNode_ = this.context_.createBiquadFilter();
  this.filterNode_.type = filterType;
  this.filterNode_.frequency.value = filterFrequency;
  this.filterNode_.Q.value = filterQ;
  this.filterNode_.gain.value = filterGain;
  if (filterLFOEnabled) {
    this.filterLFO_ = gControllerManager.newLFO(this.filterNode_.frequency,
                                                filterLFOFrequency,
                                                filterLFOPhase,
                                                filterFrequency,
                                                filterLFOGain);
  }
  if (filterEnabled) {
    this.oscillatorNode_.connect(this.filterNode_);
    this.filterNode_.connect(this.gainNode_);
  } else {
    this.oscillatorNode_.connect(this.gainNode_);
  }
  this.gainNode_.connect(outputNode);
  this.oscillatorNode_.noteOn(0);
}

Note.prototype.stop = function() {
  this.gainNode_.gain.setTargetValueAtTime(0, this.context_.currentTime, 0.1);
  thisNote = this;
  setTimeout(function() {
    thisNote.oscillatorNode_.noteOff(0);
    thisNote.oscillatorNode_.disconnect();
    thisNote.filterNode_.disconnect();
    thisNote.gainNode_.disconnect();
    if (this.lfo_)
      gControllerManager.removeController(this.lfo_);
  }, 3000);
}

Note.prototype.changeFrequency = function(frequency) {
  this.oscillatorNode_.frequency.value = frequency;
}

Note.prototype.changeWaveType = function(waveType) {
  this.oscillatorNode_.type = waveType;
}

Note.prototype.changeFilterEnabled = function(enabled) {
  this.oscillatorNode_.disconnect();
  this.filterNode_.disconnect();
  if (enabled) {
    this.oscillatorNode_.connect(this.filterNode_);
    this.filterNode_.connect(this.gainNode_);
  } else {
    this.oscillatorNode_.connect(this.gainNode_);
  }
}

Note.prototype.changeFilterType = function(filterType) {
  this.filterNode_.type = filterType;
}

Note.prototype.changeFilterFrequency = function(frequency) {
  this.filterNode_.frequency.value = frequency;
}

Note.prototype.changeFilterQ = function(Q) {
  this.filterNode_.q.value = Q;
}

Note.prototype.changeFilterGain = function(gain) {
  this.filterNode_.gain.value = gain;
}

////////////////////////////////////////////////////////////////////////////////
// Initialization

function populateSelect(selectId, array) {
  var select = document.getElementById(selectId);
  for (var i = 0; i < array.length; i++) {
    var option = document.createElement('option');
    option.value = i;
    option.text = array[i];
    select.add(option, null);
  }
}

function init() {
  gContext = new webkitAudioContext();
  gControllerManager = new ControllerManager(gContext);
  document.getElementById('play').onclick = playClicked;
  document.getElementById('octave').onchange = octaveChanged;
  document.getElementById('note').onchange = noteChanged;
  octaveChanged();
  noteChanged();
  populateSelect('waveTypes', gWaveTypes);
  document.getElementById('waveTypes').onchange = waveTypeChanged;
  populateSelect('filterTypes', gFilterTypes);
  document.getElementById('filterEnabled').onchange = filterEnabledChanged;
  document.getElementById('filterTypes').onchange = filterTypeChanged;
  document.getElementById('filterFrequency').onchange = filterFrequencyChanged;
  document.getElementById('filterQ').onchange = filterQChanged;
  document.getElementById('filterGain').onchange = filterGainChanged;
  filterEnabledChanged(); // will update type, gain and lfo enabled
  filterFrequencyChanged();
  filterQChanged();
  document.getElementById('filterLFOEnabled').onchange = filterLFOEnabledChanged;
  document.getElementById('filterLFOFrequency').onchange = filterLFOFrequencyChanged;
  document.getElementById('filterLFOGain').onchange = filterLFOGainChanged;
  document.getElementById('filterLFOPhase').onchange = filterLFOPhaseChanged;
  filterLFOFrequencyChanged();
  filterLFOGainChanged();
  filterLFOPhaseChanged();
}
  window.onload = init;

////////////////////////////////////////////////////////////////////////////////
// Settings accessors

function oscillatorFrequency() {
  var octaveEl = document.getElementById('octave');
  var noteEl = document.getElementById('note');
  return frequencyForNote(parseInt(octaveEl.value), parseInt(noteEl.value));
}

function waveType() {
  return document.getElementById('waveTypes').value;
}

function filterEnabled() {
  return document.getElementById('filterEnabled').checked;
}

function filterType() {
  return document.getElementById('filterTypes').value;
}

function filterFrequency() {
  var el = document.getElementById('filterFrequency');
  var factor = gFilterFrequencyFactors[el.value];
  return oscillatorFrequency() * factor;
}

function filterQ() {
  return document.getElementById('filterQ').value;
}

function filterGain() {
  return document.getElementById('filterGain').value;
}

function filterLFOEnabled() {
  return document.getElementById('filterLFOEnabled').checked;
}

function filterLFOFrequency() {
  var rangeValue = document.getElementById('filterLFOFrequency').value;
  rangeValue = rangeValue - (gMaxLFOFrequencyRangeValue / 2);
  rangeValue = rangeValue * gLFOFrequencyExponentFactor;
  return Math.pow(10, rangeValue);
}

function filterLFOGain() {
  var rangeValue = document.getElementById('filterLFOGain').value;
  var maxSwing = filterFrequency();
  return maxSwing * rangeValue / gMaxLFOGainRangeValue;
}

function filterLFOPhase() {
  var rangeValue = document.getElementById('filterLFOPhase').value;
  return 2 * Math.PI * rangeValue / gMaxLFOPhaseRangeValue;
}

function filterLFOPhaseDegrees() {
  var rangeValue = document.getElementById('filterLFOPhase').value;
  var value = 360 * rangeValue / gMaxLFOPhaseRangeValue;
  if (value > 180)
    value = value - 360;
  return value;
}

////////////////////////////////////////////////////////////////////////////////
// Utils
function roundForDisplay(number) {
  return Math.round(number * 100) / 100;
}

////////////////////////////////////////////////////////////////////////////////
// Event handlers

function oscillatorFrequencyChanged() {
  var outEl = document.getElementById('selectedOscillatorFrequency');
  outEl.innerHTML = roundForDisplay(oscillatorFrequency());
  if (gCurrentNote)
    gCurrentNote.changeFrequency(oscillatorFrequency());
  filterFrequencyChanged();
}

function octaveChanged() {
  var el = document.getElementById('octave');
  var outEl = document.getElementById('selectedOctave');
  outEl.innerHTML = el.value;
  oscillatorFrequencyChanged();
}

function noteChanged() {
  var el = document.getElementById('note');
  var outEl = document.getElementById('selectedNote');
  outEl.innerHTML = gNotes[el.value];
  oscillatorFrequencyChanged();
}

function waveTypeChanged() {
  if (gCurrentNote)
    gCurrentNote.changeWaveType(waveType());
}

function filterEnabledChanged() {
  document.getElementById('filterTypes').disabled = !filterEnabled();
  document.getElementById('filterFrequency').disabled = !filterEnabled();
  document.getElementById('filterQ').disabled = !filterEnabled();
  document.getElementById('filterLFOEnabled').disabled = !filterEnabled();
  if (gCurrentNote)
    gCurrentNote.changeFilterEnabled(filterEnabled());
  filterTypeChanged(); // to update gain
  filterLFOEnabledChanged();
}

function filterTypeChanged() {
  var gainEl = document.getElementById('filterGain');
  gainEl.disabled = !gFilterHasGain[filterType()] || !filterEnabled();
  filterGainChanged();
  if (gCurrentNote)
    gCurrentNote.changeFilterType(filterType());
}

function filterFrequencyChanged() {
  var el = document.getElementById('filterFrequency');
  var outEl = document.getElementById('selectedFilterFrequency');
  var freqFactor = gFilterFrequencyFactors[el.value];
  outEl.innerHTML = roundForDisplay(filterFrequency()) +
                    ' (x' + freqFactor + ')';
  if (gCurrentNote)
    gCurrentNote.changeFilterFrequency(filterFrequency());
  filterLFOGainChanged();
}

function filterQChanged() {
  var outEl = document.getElementById('selectedQ');
  outEl.innerHTML = filterQ();
  if (gCurrentNote)
    gCurrentNote.changeFilterQ(filterQ());
}

function filterGainChanged() {
  var el = document.getElementById('filterGain');
  var outEl = document.getElementById('selectedFilterGain');
  if (gFilterHasGain[filterType()])
    outEl.innerHTML = filterGain() + 'dB';
  else
    outEl.innerHTML = 'N/A';
  if (gCurrentNote)
    gCurrentNote.changeFilterGain(filterGain());
}

function filterLFOEnabledChanged() {
  var lfoEnabled = filterEnabled() && filterLFOEnabled();
  document.getElementById('filterLFOFrequency').disabled = !lfoEnabled;
  document.getElementById('filterLFOGain').disabled = !lfoEnabled;
  document.getElementById('filterLFOPhase').disabled = !lfoEnabled;
}

function filterLFOFrequencyChanged() {
  var outEl = document.getElementById('selectedFilterLFOFrequency');
  outEl.innerHTML = roundForDisplay(filterLFOFrequency());
}

function filterLFOGainChanged() {
  var outEl = document.getElementById('selectedFilterLFOGain');
  outEl.innerHTML = roundForDisplay(filterLFOGain());
}

function filterLFOPhaseChanged() {
  var outEl = document.getElementById('selectedFilterLFOPhase');
  outEl.innerHTML = filterLFOPhaseDegrees();
}

function playClicked() {
  var el = document.getElementById('play');
  if (el.checked)
    gCurrentNote = new Note(gContext,
                            gContext.destination,
                            oscillatorFrequency(),
                            waveType(),
                            filterEnabled(),
                            filterType(),
                            filterFrequency(),
                            filterQ(),
                            filterGain(),
                            filterLFOEnabled(),
                            filterLFOFrequency(),
                            filterLFOGain(),
                            filterLFOPhase());
  else if (gCurrentNote) {
    gCurrentNote.stop();
    gCurrentNote = null;
  }
}
