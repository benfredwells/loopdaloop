TestButton = (function() {

"use strict";
var module = {};

module.Button = function(parentDiv, instrument, scene, ontimechange) {
  // TODO: this should use UI.Button...
  UI.Control.call(this, parentDiv);
  this.div.id = 'testButton';
  this.div.classList.add('button');
  this.div.classList.add('persistButton');
  this.div.classList.add('testInstrumentIcon');
  this.instrument_ = instrument;

  this.textDiv = document.createElement('div');
  this.textDiv.id = 'testButtonText';
  this.textDiv.classList.add('buttonText');
  this.textDiv.innerHTML = '';
  this.div.appendChild(this.textDiv);
  
  this.scene_ = scene;
  this.ontimechange = ontimechange;

  this.noteOnTime_ = 0;
  this.noteOffTime_ = 0;
  this.noteReleaseTime_ = 0;
  this.currentTime_ = 0;

  var button = this;
  this.div.onmousedown = function(event) { button.buttonMouseDown(event); };
  this.div.onmouseup = function(event) { button.buttonMouseUp(event); };
  this.div.onmouseleave = function(event) { button.buttonMouseLeave(event); };
  this.div.ontouchstart = function(event) { button.buttonTouchStart(event); };
  this.div.ontouchend = function(event) { button.buttonTouchEnd(event); };

  window.onkeydown = function(event) { button.keyDown(event); };
  window.onkeyup = function(event) { button.keyUp(event); };
  window.onblur = function(event) { button.windowBlur(); };
}

module.Button.prototype = Object.create(UI.Control.prototype);

var kResetTime = 2;

module.Button.prototype.resetDisplay_ = function() {
  this.ontimechange(this.currentTime_, this.noteDuration_, this.noteReleaseTime_);
}

module.Button.prototype.updateDisplay_ = function() {
  var timeDelta = this.scene_.context.currentTime - this.noteOnTime_;
  var offDelta = this.scene_.context.currentTime - this.noteOffTime_;
  this.noteDuration_ = timeDelta;
  if (!this.playedNote_)
    this.noteDuration_ = this.noteOffTime_ - this.noteOnTime_;
  this.ontimechange(timeDelta, this.noteDuration_, this.noteReleaseTime_);
  var button = this;
  if (!this.playedNote_ && offDelta > this.noteReleaseTime_) {
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
  this.playedNote_ = this.instrument_.createPlayedNote(this.scene_, kTestOctave, kTestNote);
  this.playedNote_.noteOn(0);

  this.noteReleaseTime_ = this.instrument_.envelopeContour.releaseTime();
  this.noteOnTime_ = this.scene_.context.currentTime;
  this.updateDisplay_();
}

module.Button.prototype.release_ = function() {
  if (!this.playedNote_)
    return;

  this.div.classList.remove('pressed');
  if (this.playedNote_) {
    this.noteOffTime_ = this.scene_.context.currentTime;
    this.playedNote_.noteOff(0);
    this.playedNote_ = null;
  }
}

module.Button.prototype.setCurrentTime = function(currentTime) {
  this.currentTime_ = currentTime;
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

module.Button.prototype.buttonTouchStart = function(event) {
  this.press_();
  event.preventDefault();
}

module.Button.prototype.buttonTouchEnd = function(event) {
  if (this.playedNote_)
    this.release_();
  event.preventDefault();
}

module.Button.prototype.windowBlur = function() {
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
