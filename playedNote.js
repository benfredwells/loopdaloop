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
                       oscillatorNodes,
                       gainNode,
                       allNodes,
                       envelope,
                       paramControllers) {
  this.context_ = context;
  this.oscillatorNodes_ = oscillatorNodes;
  this.gainNode_ = gainNode;
  this.allNodes_ = allNodes;
  this.envelope_ = envelope;
  this.paramControllers_ = paramControllers;
}

module.Note.prototype.start = function() {
  var nextTime = this.context_.currentTime;
  this.gainNode_.gain.setValueAtTime(0, nextTime); nextTime += this.envelope_.attackDelay;
  this.gainNode_.gain.setValueAtTime(0, nextTime); nextTime += this.envelope_.attack;
  this.gainNode_.gain.linearRampToValueAtTime(1, nextTime); nextTime += this.envelope_.attackHold;
  this.gainNode_.gain.setValueAtTime(1, nextTime); nextTime += this.envelope_.decay;
  this.gainNode_.gain.linearRampToValueAtTime(this.envelope_.sustain, nextTime);
  this.sustainStart_ = nextTime;
  this.oscillatorNodes_.forEach(function (oscillator) {
    oscillator.noteOn(0);
  });
}

module.Note.prototype.stop = function() {
  var nextTime = this.context_.currentTime;
  if (nextTime < this.sustainStart_)
    nextTime = this.sustainStart_;
  nextTime += this.envelope_.sustainHold;
  this.gainNode_.gain.setValueAtTime(this.envelope_.sustain, nextTime); nextTime += this.envelope_.release;
  this.gainNode_.gain.linearRampToValueAtTime(0, nextTime);
  var thisNote = this;
  setTimeout(function() {
    thisNote.oscillatorNodes_.forEach(function(oscillator) {
      oscillator.noteOff(0);
    });
    thisNote.allNodes_.forEach(function(node) {
      node.disconnect();
    });
    thisNote.paramControllers_.forEach(function (paramController) {
      gControllerManager.removeController(paramController);
    })
  }, (this.envelope_.sustainHold + this.envelope_.release) * 1000 + 3000);
}

return module;

})();
