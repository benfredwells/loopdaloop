"use strict";

(function() {

var kOctaveKey = 'keyboardWindowOctaveField';
var kDefaultOctave = 4;

var KeyboardWrapper = function() {
  this.piano = null;
  this.octaveSelector = null;
}

KeyboardWrapper.prototype.handleLoad = function() {
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

KeyboardWrapper.prototype.handleStorageLoaded = function(items) {
  var octave = items[kOctaveKey];
  if (!octave)
    octave = kDefaultOctave;
  this.octaveSelector.setCurrentOctave(octave);
  this.setOctave();
}

KeyboardWrapper.prototype.handleKeyDown = function(event) {
  this.piano.handleKeyDown(event);
  this.octaveSelector.handleKeyDown(event);
}

KeyboardWrapper.prototype.handleKeyUp = function(event) {
  this.piano.handleKeyUp(event);
}

KeyboardWrapper.prototype.handleMouseUp = function(event) {
  this.piano.handleMouseUp(event);
  this.octaveSelector.handleMouseUp(event);
}

KeyboardWrapper.prototype.handleBlur = function(event) {
  this.piano.handleBlur(event);
}

KeyboardWrapper.prototype.handleResize = function() {
  this.piano.handleResize();
  this.octaveSelector.handleResize();
}

KeyboardWrapper.prototype.saveState = function() {
  var setting = {};
  setting[kOctaveKey] = this.octaveSelector.currentOctave();
  chrome.storage.local.set(setting);
}

KeyboardWrapper.prototype.setOctave = function() {
  this.piano.octave = this.octaveSelector.currentOctave();
}

KeyboardWrapper.prototype.octaveChanged = function() {
  this.setOctave();
  this.saveState();
}

var keyboardWrapper = new KeyboardWrapper();

window.onload = keyboardWrapper.handleLoad.bind(keyboardWrapper);
})();
