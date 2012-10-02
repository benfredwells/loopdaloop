"use strict";

var gContext = null;
var gCurrentNote = null;
var gControllerManager = null;
var gOscillatorUI = null;
var gFilterUI = null;
var gInstrument = null;
var gKeyboard = null;

////////////////////////////////////////////////////////////////////////////////
// Initialization

function init() {
  gContext = new webkitAudioContext();
  gControllerManager = new ParamController.Manager(gContext);
  var compressor = gContext.createDynamicsCompressor();
  compressor.connect(gContext.destination);
  gInstrument = new Instrument.Instrument(gContext, compressor);

  // Instrument UI setup
  gOscillatorUI = new OscillatorUI.UI(
      gInstrument,
      document.getElementById('settings'));
  gFilterUI = new FilterUI.UI(
      gInstrument,
      document.getElementById('settings'));

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
