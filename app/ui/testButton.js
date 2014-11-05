TestButton = (function() {

"use strict";
var module = {};

module.TestButton = function(parentDiv, instrument, scene, ontimechange) {
  UI.Button.call(this, parentDiv, null, '');
  this.div.classList.add('persistButton');
  this.div.classList.add('testInstrumentIcon');
  this.instrument_ = instrument;

  this.scene_ = scene;
  this.ontimechange = ontimechange;

  this.noteOnTime_ = 0;
  this.noteOffTime_ = 0;
  this.noteReleaseTime_ = 0;
  this.currentTime_ = 0;

  window.onkeydown = this.handleWindowKeyDown.bind(this);
  window.onkeyup = this.handleWindowKeyUp.bind(this);
  window.onblur = this.handleWindowBlur.bind(this);
}

module.TestButton.prototype = Object.create(UI.Button.prototype);

var kResetTime = 2;

module.TestButton.prototype.resetDisplay_ = function() {
  this.ontimechange(this.currentTime_, this.noteDuration_, this.noteReleaseTime_);
}

module.TestButton.prototype.updateDisplay_ = function() {
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

module.TestButton.prototype.press_ = function() {
  UI.Button.prototype.press_.call(this);

  if (this.playedNote_)
    return;

  this.playedNote_ = this.instrument_.createPlayedNote(this.scene_, kTestOctave, kTestNote);
  this.playedNote_.noteOn(0);

  this.noteReleaseTime_ = this.instrument_.envelopeContour.releaseTime();
  this.noteOnTime_ = this.scene_.context.currentTime;
  this.updateDisplay_();
}

module.TestButton.prototype.unpress_ = function() {
  UI.Button.prototype.unpress_.call(this);

  if (!this.playedNote_)
    return;

  if (this.playedNote_) {
    this.noteOffTime_ = this.scene_.context.currentTime;
    this.playedNote_.noteOff(0);
    this.playedNote_ = null;
  }
}

module.TestButton.prototype.setCurrentTime = function(currentTime) {
  this.currentTime_ = currentTime;
}

module.TestButton.prototype.handleWindowKeyDown = function(event) {
  if (event.keyCode == 'T'.charCodeAt(0))
    this.press_();
}

module.TestButton.prototype.handleWindowKeyUp = function(event) {
  if (event.keyCode == 'T'.charCodeAt(0))
    this.unpress_();
}

module.TestButton.prototype.handleWindowBlur = function(event) {
  this.unpress_();
}

return module;

})();
