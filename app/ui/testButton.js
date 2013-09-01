TestButton = (function() {

"use strict";
var module = {};

module.Button = function(parentDiv, instrument) {
  SettingsUI.Control.call(this, parentDiv);
  this.div.id = 'testButton';
  this.instrument_ = instrument;

  this.textDiv = document.createElement('div');
  this.textDiv.id = 'testButtonText';
  this.textDiv.innerHTML = Strings.kTest;
  this.div.appendChild(this.textDiv);
  
  this.shortcutSpan = document.createElement('span');
  this.shortcutSpan.id = 'testButtonShortcut';
  this.shortcutSpan.innerHTML = Strings.kTestShortcut;
  this.textDiv.appendChild(this.shortcutSpan);

  this.pressed = false;

  var button = this;
  this.div.onmousedown = function(event) { button.buttonMouseDown(event); };
  this.div.onmouseup = function(event) { button.buttonMouseUp(event); };
  this.div.onmouseleave = function(event) { button.buttonMouseLeave(event); };
  window.onkeydown = function(event) { button.keyDown(event); };
  window.onkeyup = function(event) { button.keyUp(event); };
}

module.Button.prototype = Object.create(SettingsUI.Control.prototype);

var kTestOctave = 4;
var kTestNote = 9;

module.Button.prototype.press_ = function() {
  if (this.pressed)
    return;

  this.pressed = true;
  this.div.classList.add('pressed');
  this.playedNote_ = this.instrument_.createPlayedNote(kTestOctave, kTestNote);
  this.playedNote_.noteOn(0);
}

module.Button.prototype.release_ = function() {
  if (!this.pressed)
    return;

  this.pressed = false;
  this.div.classList.remove('pressed');
  if (this.playedNote_) {
    this.playedNote_.noteOff(0);
    this.playedNote_ = null;
  }
}

module.Button.prototype.buttonMouseDown = function(event) {
  if (event.button == 0)
    this.press_();
}

module.Button.prototype.buttonMouseUp = function(event) {
  if (event.button == 0)
    this.release_();
}

module.Button.prototype.buttonMouseLeave = function(event) {
  if (this.pressed)
    this.release_();
}

module.Button.prototype.keyDown = function(event) {
  if (event.keyCode == 'T'.charCodeAt(0))
    this.press_();
}

module.Button.prototype.keyUp = function(event) {
  if (event.keyCode == 'T'.charCodeAt(0))
    this.release_();
}

return module;

})();
