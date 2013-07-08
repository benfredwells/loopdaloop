Contour = (function() {

"use strict";
var module = {};

////////////////////////////////////////////////////////////////////////////////
// Contourer interface
//   contourOn = function(onTime)
//   contourOff = function(offTime)
//   contourFinishTime = function(offTime) returns time

////////////////////////////////////////////////////////////////////////////////
// Flat contoured value
module.FlatContouredValue = function() {
  this.value = 1;
}

module.FlatContouredValue.prototype.addContour = function(valueFunction, param, noteSection) {
  param.value = valueFunction(this.value);
}

////////////////////////////////////////////////////////////////////////////////
// Oscillating contoured value
module.OscillatingContouredValue = function(context) {
  this.context_ = context;
  this.centerValue = 1;
  this.type = 'sine';
  this.amplitude = 1;
  this.frequency = 1;
}

module.OscillatingContouredValue.prototype.addContour = function(valueFunction, param, noteSection) {
  param.value = valueFunction(this.centerValue);

  var oscillator = this.context_.createOscillator();
  oscillator.type = 'sine';
  oscillator.frequency.value = this.frequency;
  noteSection.oscillatorNodes.push(oscillator);
  noteSection.allNodes.push(oscillator);
  var gain = this.context_.createGainNode();
  gain.gain.value = this.amplitude * param.value;
  noteSection.allNodes.push(gain);
  oscillator.connect(gain);
  gain.connect(param);
}

////////////////////////////////////////////////////////////////////////////////
// Identifiers for contour types
module.kFlatContour = 'flat';
module.kOscillatingContour = 'oscillating';

////////////////////////////////////////////////////////////////////////////////
// Contoured value
module.ContouredValue = function(context) {
  this.currentContourIdentifier = module.kFlatContour;
  this.contours = [];
  this.contoursByIdentifier = {};
  this.initContour_(module.kFlatContour, new module.FlatContouredValue());
  this.initContour_(module.kOscillatingContour, new module.OscillatingContouredValue(context));
}

module.ContouredValue.prototype.initContour_ = function(identifier, contour) {
  this.contours.push(contour);
  this.contoursByIdentifier[identifier] = contour;
}

module.ContouredValue.prototype.currentContour = function() {
  return this.contoursByIdentifier[this.currentContourIdentifier];
}

return module;

}());
