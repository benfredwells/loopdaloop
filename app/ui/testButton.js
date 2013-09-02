TestButton = (function() {

"use strict";
var module = {};

module.Button = function(parentDiv, instrument, context, ontimechange) {
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

  this.context_ = context;
  this.ontimechange = ontimechange;

  this.noteOnTime = 0;
  this.noteOffTime = 0;
  this.noteReleaseTime = 0;

  var button = this;
  this.div.onmousedown = function(event) { button.buttonMouseDown(event); };
  this.div.onmouseup = function(event) { button.buttonMouseUp(event); };
  this.div.onmouseleave = function(event) { button.buttonMouseLeave(event); };
  window.onkeydown = function(event) { button.keyDown(event); };
  window.onkeyup = function(event) { button.keyUp(event); };
}

module.Button.prototype = Object.create(SettingsUI.Control.prototype);

var kResetTime = 3;

module.Button.prototype.resetDisplay_ = function() {
  this.ontimechange(0, this.noteDuration);
}

module.Button.prototype.updateDisplay_ = function() {
  var timeDelta = this.context_.currentTime - this.noteOnTime;
  var offDelta = this.context_.currentTime - this.noteOffTime;
  this.noteDuration = timeDelta;
  if (!this.playedNote_)
    this.noteDuration = this.noteOffTime - this.noteOnTime;
  this.ontimechange(timeDelta, this.noteDuration);
  var button = this;
  if (!this.playedNote_ && offDelta > this.noteReleaseTime) {
    setTimeout(function() { button.resetDisplay_(); }, kResetTime * 1000);
  } else {
    window.requestAnimationFrame(function() { button.updateDisplay_(); });
  }
}

var kTestOctave = 4;
var kTestNote = 9;

module.Button.prototype.press_ = function() {
  if (this.playedNote_)
    return;

  this.div.classList.add('pressed');
  this.playedNote_ = this.instrument_.createPlayedNote(kTestOctave, kTestNote);
  this.playedNote_.noteOn(0);

  this.noteReleaseTime = this.instrument_.envelopeContour.releaseTime();
  this.noteOnTime = this.context_.currentTime;
  this.updateDisplay_();
}

module.Button.prototype.release_ = function() {
  if (!this.playedNote_)
    return;

  this.div.classList.remove('pressed');
  if (this.playedNote_) {
    this.noteOffTime = this.context_.currentTime;
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
  if (this.playedNote_)
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
