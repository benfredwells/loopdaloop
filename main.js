"use strict";

var gContext = null;
var gCurrentNote = null;
var gControllerManager = null;
var gInstrumentUI = null;
var gInstrument = null;
var gKeyboard = null;

////////////////////////////////////////////////////////////////////////////////
// Initialization

function init() {
  gContext = new webkitAudioContext();
  gControllerManager = new ControllerManager(gContext);
  var compressor = gContext.createDynamicsCompressor();
  compressor.connect(gContext.destination);
  gInstrument = new Instrument.Instrument(gContext, compressor);

  // Instrument UI setup
  gInstrumentUI = new InstrumentUI.UI(
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
  gKeyboard = new KeyboardPiano.Piano(4, gInstrument, document.getElementById('keyboard'));
  octaveChanged();
}

window.onload = init;

////////////////////////////////////////////////////////////////////////////////
// Settings accessors

function octave() {
  return parseInt(document.getElementById('octave').value);
}

////////////////////////////////////////////////////////////////////////////////
// Event handlers

function octaveChanged() {
  gKeyboard.octave = octave();

  var el = document.getElementById('octave');
  var outEl = document.getElementById('selectedOctave');
  outEl.innerHTML = el.value;
}

