"use strict";

var gKeyboard = null;

var kOctaveKey = 'keyboardWindowOctaveField';

////////////////////////////////////////////////////////////////////////////////
// Initialization

function init() {
  // Player setup
  chrome.storage.local.get(kOctaveKey, function(items) {
    gKeyboard = new KeyboardPiano.Piano(gInstrument, document.getElementById('keyboard'), document.getElementById('octave'));
    var octave = items[kOctaveKey];
    if (!octave)
      octave = 4;
    var el = document.getElementById('octave');
    el.onchange = octaveChanged;
    el.value = octave;
    setOctave();
  });
}

window.onload = init;

////////////////////////////////////////////////////////////////////////////////
// Settings accessors

function octave() {
  return parseInt(document.getElementById('octave').value);
}

////////////////////////////////////////////////////////////////////////////////
// Event handlers

function saveState() {
  var setting = {};
  setting[kOctaveKey] = octave();
  chrome.storage.local.set(setting);
}

function setOctave() {
  gKeyboard.octave = octave();

  var el = document.getElementById('octave');
  var outEl = document.getElementById('selectedOctave');
  outEl.innerHTML = el.value;
}

function octaveChanged() {
  setOctave();
  saveState();
}
