"use strict";

var gKeyboard = null;

////////////////////////////////////////////////////////////////////////////////
// Initialization

function init() {
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
