"use strict";

//TODO: make this a class
var gKeyboard = null;
var gOctaveSelector = null;

var kOctaveKey = 'keyboardWindowOctaveField';

////////////////////////////////////////////////////////////////////////////////
// Initialization
function init() {
  // Player setup
//  chrome.storage.local.get(kOctaveKey, function(items) {
    gKeyboard = new KeyboardPiano.Piano(gInstrument, document.getElementById('keyboard'), document.getElementById('octave'));
    gOctaveSelector = new OctaveUI.Selector(document.body);
//    var octave = items[kOctaveKey];
//    if (!octave)
//      octave = 4;
//    var el = document.getElementById('octave');
//    el.onchange = octaveChanged;
//    el.value = octave;
    setOctave();
//  });
}

window.onload = init;

////////////////////////////////////////////////////////////////////////////////
// Settings accessors

function octave() {
  return 4;
//  return parseInt(document.getElementById('octave').value);
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

//  var el = document.getElementById('octave');
//  var outEl = document.getElementById('selectedOctave');
//  outEl.innerHTML = el.value;
}

function octaveChanged() {
  setOctave();
  saveState();
}
