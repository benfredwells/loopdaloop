var gContext = null;
var gCurrentNote = null;
var gControllerManager = null;
var gInstrument = null;

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
//   Make calculations common in instrument etc.
//   Separate instrument setting from UI updating (inputs from outputs)
//   Hook up to keys :)
//   Fancy keyboard display
// Affect pitch with LFO
// Affect volume with LFO
// ADSR envelope
// Option to have filter cutoff not related to pitch
// Multiple filters
// Looping!

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
  gInstrument = new Instrument(gContext);
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

function note() {
  return parseInt(document.getElementById('note').value);
}

function octave() {
  return parseInt(document.getElementById('octave').value);
}

function oscillatorFrequency() {
  return frequencyForNote(octave(), note());
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

function filterFrequencyFactor() {
  var el = document.getElementById('filterFrequency');
  return gFilterFrequencyFactors[el.value];
}

function filterFrequency() {
  return oscillatorFrequency() * filterFrequencyFactor();
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

function filterLFOGainFactor() {
  var rangeValue = document.getElementById('filterLFOGain').value;
  return rangeValue / gMaxLFOGainRangeValue;
}

function filterLFOGain() {
  var maxSwing = filterFrequency();
  return maxSwing * filterLFOGainFactor();
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
  filterFrequencyChanged();
}

function octaveChanged() {
  gInstrument.octave = octave();

  var el = document.getElementById('octave');
  var outEl = document.getElementById('selectedOctave');
  outEl.innerHTML = el.value;
  oscillatorFrequencyChanged();
}

function noteChanged() {
  gInstrument.note = note();

  var el = document.getElementById('note');
  var outEl = document.getElementById('selectedNote');
  outEl.innerHTML = gNotes[el.value];
  oscillatorFrequencyChanged();
}

function waveTypeChanged() {
  gInstrument.oscillatorType = waveType();
}

function filterEnabledChanged() {
  gInstrument.filterEnabled = filterEnabled();

  document.getElementById('filterTypes').disabled = !filterEnabled();
  document.getElementById('filterFrequency').disabled = !filterEnabled();
  document.getElementById('filterQ').disabled = !filterEnabled();
  document.getElementById('filterLFOEnabled').disabled = !filterEnabled();
  filterTypeChanged(); // to update gain
  filterLFOEnabledChanged();
}

function filterTypeChanged() {
  gInstrument.filterType = filterType();

  var gainEl = document.getElementById('filterGain');
  gainEl.disabled = !gFilterHasGain[filterType()] || !filterEnabled();
  filterGainChanged();
}

function filterFrequencyChanged() {
  gInstrument.filterFrequencyFactor = filterFrequencyFactor();

  var el = document.getElementById('filterFrequency');
  var outEl = document.getElementById('selectedFilterFrequency');
  var freqFactor = gFilterFrequencyFactors[el.value];
  outEl.innerHTML = roundForDisplay(filterFrequency()) +
                    ' (x' + freqFactor + ')';
  filterLFOGainChanged();
}

function filterQChanged() {
  gInstrument.filterQ = filterQ();

  var outEl = document.getElementById('selectedQ');
  outEl.innerHTML = filterQ();
}

function filterGainChanged() {
  gInstrument.filterGain = filterGain();

  var el = document.getElementById('filterGain');
  var outEl = document.getElementById('selectedFilterGain');
  if (gFilterHasGain[filterType()])
    outEl.innerHTML = filterGain() + 'dB';
  else
    outEl.innerHTML = 'N/A';
}

function filterLFOEnabledChanged() {
  var lfoEnabled = filterEnabled() && filterLFOEnabled();
  gInstrument.filterLFOEnabled = lfoEnabled;

  document.getElementById('filterLFOFrequency').disabled = !lfoEnabled;
  document.getElementById('filterLFOGain').disabled = !lfoEnabled;
  document.getElementById('filterLFOPhase').disabled = !lfoEnabled;
}

function filterLFOFrequencyChanged() {
  gInstrument.filterLFOFrequency = filterLFOFrequency();

  var outEl = document.getElementById('selectedFilterLFOFrequency');
  outEl.innerHTML = roundForDisplay(filterLFOFrequency());
}

function filterLFOGainChanged() {
  gInstrument.filterLFOGainFactor = filterLFOGainFactor();

  var outEl = document.getElementById('selectedFilterLFOGain');
  outEl.innerHTML = roundForDisplay(filterLFOGain());
}

function filterLFOPhaseChanged() {
  gInstrument.filterLFOPhase = filterLFOPhase();

  var outEl = document.getElementById('selectedFilterLFOPhase');
  outEl.innerHTML = filterLFOPhaseDegrees();
}

function playClicked() {
  var el = document.getElementById('play');
  if (el.checked) {
    gCurrentNote = gInstrument.createPlayedNote(octave(), note());
    gCurrentNote.start();
  } else if (gCurrentNote) {
    gCurrentNote.stop();
    gCurrentNote = null;
  }
}
