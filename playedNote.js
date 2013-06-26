PlayedNote = (function() {

"use strict";
var module = {};

////////////////////////////////////////////////////////////////////////////////
// Envelope class

module.Envelope = function() {
  this.attackDelay = 0;
  this.attack = 0;
  this.attackHold = 0;
  this.decay = 0;
  this.sustain = 1;
  this.sustainHold = 0;
  this.release = 0;
}

////////////////////////////////////////////////////////////////////////////////
// PlayedNote class

module.Note = function(context,
                       envelope) {
  this.context_ = context;
  this.oscillatorNodes = [];
  this.gainNode = null;
  this.allNodes = [];
  this.paramControllers = [];
  this.envelope_ = envelope;
}

module.Note.prototype.start = function() {
  var nextTime = this.context_.currentTime;
  this.gainNode.gain.setValueAtTime(0, nextTime); nextTime += this.envelope_.attackDelay;
  this.gainNode.gain.setValueAtTime(0, nextTime); nextTime += this.envelope_.attack;
  this.gainNode.gain.linearRampToValueAtTime(1, nextTime); nextTime += this.envelope_.attackHold;
  this.gainNode.gain.setValueAtTime(1, nextTime); nextTime += this.envelope_.decay;
  this.gainNode.gain.linearRampToValueAtTime(this.envelope_.sustain, nextTime);
  this.sustainStart_ = nextTime;
  this.oscillatorNodes.forEach(function (oscillator) {
    oscillator.noteOn(0);
  });
}

module.Note.prototype.stop = function() {
  var nextTime = this.context_.currentTime;
  if (nextTime < this.sustainStart_)
    nextTime = this.sustainStart_;
  nextTime += this.envelope_.sustainHold;
  this.gainNode.gain.setValueAtTime(this.envelope_.sustain, nextTime); nextTime += this.envelope_.release;
  this.gainNode.gain.linearRampToValueAtTime(0, nextTime);
  var thisNote = this;
  setTimeout(function() {
    thisNote.oscillatorNodes.forEach(function(oscillator) {
      oscillator.noteOff(0);
    });
    thisNote.allNodes.forEach(function(node) {
      node.disconnect();
    });
    thisNote.paramControllers.forEach(function (paramController) {
      gControllerManager.removeController(paramController);
    })
  }, (this.envelope_.sustainHold + this.envelope_.release) * 1000 + 3000);
}

return module;

})();
