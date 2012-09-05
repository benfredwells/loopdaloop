PlayedNote = (function() {

"use strict";
var module = [];

////////////////////////////////////////////////////////////////////////////////
// PlayedNote class

module.Note = function(context,
                       oscillatorNodes,
                       gainNode,
                       allNodes,
                       paramControllers) {
  this.context_ = context;
  this.oscillatorNodes_ = oscillatorNodes;
  this.gainNode_ = gainNode;
  this.allNodes_ = allNodes;
  this.paramControllers_ = paramControllers;
}

module.Note.prototype.start = function() {
  this.gainNode_.gain.setValueAtTime(0, this.context_.currentTime);
  this.gainNode_.gain.setTargetValueAtTime(1, this.context_.currentTime, 0.1);
  this.oscillatorNodes_.forEach(function (oscillator) {
    oscillator.noteOn(0);
  });
}

module.Note.prototype.stop = function() {
  this.gainNode_.gain.setTargetValueAtTime(0, this.context_.currentTime, 0.1);
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
  }, 3000);
}

return module;

})();
