var gContext = null;
var gCurrentNote = null;
var gControllerManager = null;
var gInstrumentUI = null;
var gInstrument = null;
var gKeyboard = null;

// Todo:
// Cleanup
//   Hide things in anon functions
//   Make calculations common in instrument etc.
//   Separate instrument setting from UI updating (inputs from outputs)
// Play notes on keyboard
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

function init() {
  gContext = new webkitAudioContext();
  gControllerManager = new ControllerManager(gContext);
  var compressor = gContext.createDynamicsCompressor();
  compressor.connect(gContext.destination);
  gInstrument = new Instrument(gContext, compressor);

  // Instrument UI setup
  gInstrumentUI = new InstrumentUI(
      gInstrument,
      document.getElementById('waveTypes'),
      // filter settings
      document.getElementById('filterEnabled'),
      document.getElementById('filterTypes'),
      document.getElementById('filterFrequency'),
      document.getElementById('filterQ'),
      document.getElementById('filterGain'),
      // filterLFO settings
      document.getElementById('filterLFOEnabled'),
      document.getElementById('filterLFOFrequency'),
      document.getElementById('filterLFOGain'),
      document.getElementById('filterLFOPhase'),
      // filter display
      document.getElementById('selectedFilterFrequency'),
      document.getElementById('selectedQ'),
      document.getElementById('selectedFilterGain'),
      // filterLFO display
      document.getElementById('selectedFilterLFOFrequency'),
      document.getElementById('selectedFilterLFOGain'),
      document.getElementById('selectedFilterLFOPhase'));

  // Player setup
  octaveChanged();
  noteChanged();
  document.getElementById('octave').onchange = octaveChanged;
  document.getElementById('note').onchange = noteChanged;
  document.getElementById('play').onclick = playClicked;
  gKeyboard = new KeyboardPiano(4, gInstrument);
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
