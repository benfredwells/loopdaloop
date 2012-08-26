var gContext = null;
var gCurrentNote = null;
var gControllerManager = null;
var gInstrumentUI = null;
var gInstrument = null;

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

  // Instrument UI setup
  gInstrumentUI = new InstrumentUI(
      document.getElementById('waveTypes').onchange,
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
      document.getElementById('selectedFilterLFOPhase')) {
    )
  gInstrument = gInstrumentUI.instrument();

  // Player setup
  octaveChanged();
  noteChanged();
  document.getElementById('octave').onchange = octaveChanged;
  document.getElementById('note').onchange = noteChanged;
  document.getElementById('play').onclick = playClicked;
  window.onkeydown = keyDown;
  window.onkeyup = keyUp;
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

function keyDown(event) {
  if (event.keyCode == 'C'.charCodeAt(0)) {
    if (gCurrentNote) {
      gCurrentNote.stop();
      gCurrentNote = null;
    }
    gCurrentNote = gInstrument.createPlayedNote(octave(), note());
    gCurrentNote.start();
  }
}

function keyUp(event) {
  if (event.keyCode == 'C'.charCodeAt(0)) {
    gCurrentNote.stop();
    gCurrentNote = null;
  }
}
