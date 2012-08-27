var gContext = null;
var gCurrentNote = null;
var gControllerManager = null;
var gInstrumentUI = null;
var gInstrument = null;
var gKeyboard = null;

// Todo:
// Cleanup
//   Turn on strict
//   Hide things in anon functions
//   Make calculations common in instrument etc.
//   Separate instrument setting from UI updating (inputs from outputs)
//   Use new class pattern
// Play notes on keyboard
//   Fancy keyboard display
// Synthesizer
//   Affect pitch with LFO
//   Affect volume with LFO
//   ADSR envelope
//   Option to have filter cutoff not related to pitch
//   Multiple filters
//   Feedback
//   More?
// Sampler
//   Basic instrument hooked up to a file
//   Assign samples to keys
//   ADSR envelope etc.
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
  document.getElementById('octave').onchange = octaveChanged;
  document.getElementById('note').onchange = noteChanged;
  document.getElementById('play').onclick = playClicked;
  gKeyboard = new KeyboardPiano(4, gInstrument);
  octaveChanged();
  noteChanged();
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
  gKeyboard.octave = octave();

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
