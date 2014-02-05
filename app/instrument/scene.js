Scene = (function() {

"use strict"

var module = {}

var kOutputGain = 0.05;
var kCompressorThreshold = -30;
var kCompressorKnee = 10;
var kCompressorAttack = 0.01;
var kCompressorRelease = 1;

module.Scene = function() {
  this.context = new webkitAudioContext();
  var compressor = this.context.createDynamicsCompressor();
  compressor.threshold.value = kCompressorThreshold;
  compressor.knee.value = kCompressorKnee;
  compressor.attack.value = kCompressorAttack;
  compressor.release.value = kCompressorRelease;
  compressor.connect(this.context.destination);
  this.destinationNode = this.context.createGainNode();
  this.destinationNode.gain.value = kOutputGain;
  this.destinationNode.connect(compressor);
}

return module;

})();