var gContext = null;
var gCurrentNote = null;

////////////////////////////////////////////////////////////////////////////////
// Oscillator constants
var gNotes = ['C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb',
              'G', 'G#/Ab', 'A', 'A#/Bb', 'B'];
var gMiddleAFrequency = 440;
var gMiddleAIndex = (4 * 12) + 9;
var gNoteFactor = Math.pow(2, 1 / 12);
var gWaveTypes = ['SINE', 'SQUARE', 'SAWTOOTH', 'TRIANGLE'];

////////////////////////////////////////////////////////////////////////////////
// Filter constants
var gFilterTypes = ['LOWPASS', 'HIGHPASS', 'BANDPASS', 'LOWSHELF', 'HIGHSHELF',
                    'PEAKING', 'NOTCH', 'HIGHPASS'];
var gFilterHasGain = [false, false, false, true, true, true, false, false];
var gFilterFrequencyFactors = [0.5, 0.707, 1, 1.414, 2, 2.828];

// Todo:
// 1. Output filter with LFO
// 2. Affect pitch with LFO
// 3. Affect volume with LFO
// 4. ADSR envelope
// 5. Multiple sources

////////////////////////////////////////////////////////////////////////////////
// The Note class
function Note(context, outputNode, frequency, waveType) {
  this.context_ = context;
  this.oscillatorNode_ = this.context_.createOscillator();
  this.oscillatorNode_.frequency.value = frequency;
  this.oscillatorNode_.type = waveType;
  this.gainNode_ = this.context_.createGainNode();
  this.gainNode_.gain.setValueAtTime(0, this.context_.currentTime);
  this.gainNode_.gain.setTargetValueAtTime(1, this.context_.currentTime, 0.1);
  this.oscillatorNode_.connect(this.gainNode_);
  this.gainNode_.connect(outputNode);
  this.oscillatorNode_.noteOn(0);
}

Note.prototype.stop = function() {
  this.gainNode_.gain.setTargetValueAtTime(0, this.context_.currentTime, 0.1);
  thisNote = this;
  setTimeout(function() {
    thisNote.oscillatorNode_.noteOff(0);
    thisNote.oscillatorNode_.disconnect();
    thisNote.gainNode_.disconnect();
  }, 3000);
}

Note.prototype.changeFrequency = function(frequency) {
  this.oscillatorNode_.frequency.value = frequency;
}

Note.prototype.changeWaveType = function(waveType) {
  this.oscillatorNode_.type = waveType;
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
  document.getElementById('play').onclick = playClicked;
  document.getElementById('octave').onchange = octaveChanged;
  document.getElementById('note').onchange = noteChanged;
  octaveChanged();
  noteChanged();
  populateSelect('waveTypes', gWaveTypes);
  document.getElementById('waveTypes').onchange = waveTypeChanged;
  populateSelect('filterTypes', gFilterTypes);
  document.getElementById('filterTypes').onchange = filterTypeChanged;
  document.getElementById('filterFrequency').onchange = filterFrequencyChanged;
  document.getElementById('filterQ').onchange = filterQChanged;
  document.getElementById('filterGain').onchange = filterGainChanged;
  filterTypeChanged(); // will update gain too
  filterFrequencyChanged();
  filterQChanged();
}
window.onload = init;

////////////////////////////////////////////////////////////////////////////////
// Accessors for values

function oscillatorFrequency() {
  var octaveEl = document.getElementById('octave');
  var noteEl = document.getElementById('note');
  var noteIndex = (12 * parseInt(octaveEl.value)) + parseInt(noteEl.value);
  return gMiddleAFrequency * Math.pow(gNoteFactor, noteIndex - gMiddleAIndex);
}

function waveType() {
  var select = document.getElementById('waveTypes');
  return select.value;
}

////////////////////////////////////////////////////////////////////////////////
// Event handlers

function oscillatorFrequencyChanged() {
  var outEl = document.getElementById('selectedOscillatorFrequency');
  var frequencyToPrint = Math.round(oscillatorFrequency() * 100) / 100;
  outEl.innerHTML = frequencyToPrint;
  if (gCurrentNote)
    gCurrentNote.changeFrequency(oscillatorFrequency());
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

function filterTypeChanged() {
  var el = document.getElementById('filterTypes');
  var gainEl = document.getElementById('filterGain');
  gainEl.disabled = !gFilterHasGain[el.value];
}

function filterFrequencyChanged() {
  var el = document.getElementById('filterFrequency');
  var outEl = document.getElementById('selectedFilterFrequency');
  //var freqFactor =
}

function filterQChanged() {

}

function filterGainChanged() {

}

function playClicked() {
  var el = document.getElementById('play');
  if (el.checked)
    gCurrentNote = new Note(gContext,
                            gContext.destination,
                            oscillatorFrequency(),
                            waveType());
  else if (gCurrentNote) {
    gCurrentNote.stop();
    gCurrentNote = null;
  }
}
