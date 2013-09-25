"use strict";

//TODO: make this a class
var gKeyboard = null;
var gOctaveSelector = null;

var kOctaveKey = 'keyboardWindowOctaveField';
var kDefaultOctave = 4;

////////////////////////////////////////////////////////////////////////////////
// Initialization
function init() {
  // Player setup
  gKeyboard = new KeyboardPiano.Piano(document.body, gInstrument);
  gOctaveSelector = new OctaveUI.Selector(document.body, octaveChanged);
  resize();
  chrome.storage.local.get(kOctaveKey, function(items) {
    var octave = items[kOctaveKey];
    if (!octave)
      octave = kDefaultOctave;
    gOctaveSelector.setCurrentOctave(octave);
    setOctave();
  });
}

function keyDown(event) {
  gKeyboard.handleKeyDown(event);
  gOctaveSelector.handleKeyDown(event);
}

function keyUp(event) {
  gKeyboard.handleKeyUp(event);
}

function mouseUp(event) {
  gKeyboard.handleMouseUp(event);
  gOctaveSelector.handleMouseUp(event);
}

function resize() {
  gKeyboard.handleResize();
  gOctaveSelector.handleResize();
}

window.onload = init;
window.onkeydown = keyDown;
window.onkeyup = keyUp;
window.onmouseup = mouseUp;
window.onresize = resize;

function saveState() {
  var setting = {};
  setting[kOctaveKey] = gOctaveSelector.currentOctave();
  chrome.storage.local.set(setting);
}

function setOctave() {
  gKeyboard.octave = gOctaveSelector.currentOctave();
}

function octaveChanged() {
  setOctave();
  saveState();
}
