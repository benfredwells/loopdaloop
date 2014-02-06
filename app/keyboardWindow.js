"use strict";

// TODO: wrap in anon function
// TODO: rename to wrapper
var kOctaveKey = 'keyboardWindowOctaveField';
var kDefaultOctave = 4;

var KeyboardWindow = function() {
  this.piano = null;
  this.octaveSelector = null;
}

KeyboardWindow.prototype.handleLoad = function() {
  this.piano = new KeyboardPiano.Piano(document.body, gBackgroundPage.scene, gBackgroundPage.instrument);
  this.octaveSelector = new OctaveUI.Selector(document.body, this.octaveChanged.bind(this));
  this.handleResize();
  window.onkeydown = this.handleKeyDown.bind(this);
  window.onkeyup = this.handleKeyUp.bind(this);
  window.onmouseup = this.handleMouseUp.bind(this);
  window.onresize = this.handleResize.bind(this);
  window.onblur = this.handleBlur.bind(this);
  chrome.storage.local.get(kOctaveKey, this.handleStorageLoaded.bind(this));
}

KeyboardWindow.prototype.handleStorageLoaded = function(items) {
  var octave = items[kOctaveKey];
  if (!octave)
    octave = kDefaultOctave;
  this.octaveSelector.setCurrentOctave(octave);
  this.setOctave();
}

KeyboardWindow.prototype.handleKeyDown = function(event) {
  this.piano.handleKeyDown(event);
  this.octaveSelector.handleKeyDown(event);
}

KeyboardWindow.prototype.handleKeyUp = function(event) {
  this.piano.handleKeyUp(event);
}

KeyboardWindow.prototype.handleMouseUp = function(event) {
  this.piano.handleMouseUp(event);
  this.octaveSelector.handleMouseUp(event);
}

KeyboardWindow.prototype.handleBlur = function(event) {
  this.piano.handleBlur(event);
}

KeyboardWindow.prototype.handleResize = function() {
  this.piano.handleResize();
  this.octaveSelector.handleResize();
}

KeyboardWindow.prototype.saveState = function() {
  var setting = {};
  setting[kOctaveKey] = this.octaveSelector.currentOctave();
  chrome.storage.local.set(setting);
}

KeyboardWindow.prototype.setOctave = function() {
  this.piano.octave = this.octaveSelector.currentOctave();
}

KeyboardWindow.prototype.octaveChanged = function() {
  this.setOctave();
  this.saveState();
}

var gKeyboardWindow = new KeyboardWindow();

window.onload = gKeyboardWindow.handleLoad.bind(gKeyboardWindow);