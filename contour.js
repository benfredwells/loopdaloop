Contour = (function() {

"use strict";
var module = {};

var kMinChangeTime = 0.05;

////////////////////////////////////////////////////////////////////////////////
// Contourer interface
//   contourOn = function(onTime)
//   contourOff = function(offTime)
//   contourFinishTime = function(offTime) returns time

////////////////////////////////////////////////////////////////////////////////
// BasicEnvelopeContourer class
module.BasicEnvelopeContourer = function(param, value) {
  this.param_ = param;
  this.value_ = value;
}

module.BasicEnvelopeContourer.prototype.contourOn = function(onTime) {
  this.param_.setValueAtTime(0, onTime);
  this.param_.linearRampToValueAtTime(this.value_, onTime + kMinChangeTime);
}

module.BasicEnvelopeContourer.prototype.contourOff = function(offTime) {
  this.param_.linearRampToValueAtTime(0, offTime + kMinChangeTime);
}

module.BasicEnvelopeContourer.prototype.contourFinishTime = function(offTime) {
  return offTime + kMinChangeTime;
}

////////////////////////////////////////////////////////////////////////////////
// Flat contour
module.FlatContour = function(contouredValue) {
  this.contouredValue_ = contouredValue;
  this.value = 1;
}

module.FlatContour.prototype.addContour = function(valueFunction, param, noteSection) {
  var flatValue = valueFunction(this.value);
  if (this.contouredValue_.isEnvelope)
    noteSection.addContour(new module.BasicEnvelopeContourer(param, flatValue));
  else
    param.value = flatValue;
}

module.FlatContour.prototype.averageValue = function(valueFunction) {
  return valueFunction(this.value);
}

////////////////////////////////////////////////////////////////////////////////
// Oscillating contour
module.OscillatingContour = function(contouredValue) {
  this.contouredValue_ = contouredValue;
  this.centerValue = 1;
  this.type = 'sine';
  this.amplitude = 1;
  this.frequency = 1;
}

module.OscillatingContour.prototype.addContour = function(valueFunction, param, noteSection) {
  var centerValue = valueFunction(this.centerValue);
  if (this.contouredValue_.isEnvelope)
    noteSection.addContour(new module.BasicEnvelopeContourer(param, centerValue));
  else
    param.value = valueFunction(this.centerValue);

  var oscillator = this.contouredValue_.context_.createOscillator();
  oscillator.type = 'sine';
  oscillator.frequency.value = this.frequency;
  noteSection.oscillatorNodes.push(oscillator);
  noteSection.allNodes.push(oscillator);
  var gain = this.contouredValue_.context_.createGainNode();
  var amplitudeValue = this.amplitude * centerValue;
  if (this.contouredValue_.isEnvelope)
    noteSection.addContour(new module.BasicEnvelopeContourer(gain.gain, amplitudeValue));
  else
    gain.gain.value = amplitudeValue;
  noteSection.allNodes.push(gain);
  oscillator.connect(gain);
  gain.connect(param);
}

module.OscillatingContour.prototype.averageValue = function(valueFunction) {
  return valueFunction(this.centerValue);
}

////////////////////////////////////////////////////////////////////////////////
// ADSRContourer class
module.ADSRContourer = function(contour, param, valueFunction) {
  this.contour_ = contour;
  this.param_ = param;
  this.valueFunction_ = valueFunction;
}

module.ADSRContourer.prototype.contourOn = function(onTime) {
  var nextTime = onTime;
  var v = this.valueFunction_;
  this.param_.setValueAtTime(v(this.contour_.initialValue), nextTime);
  nextTime += this.contour_.attackDelay;
  this.param_.setValueAtTime(v(this.contour_.initialValue), nextTime);
  nextTime += this.contour_.attackTime;
  this.param_.linearRampToValueAtTime(v(this.contour_.attackValue), nextTime);
  nextTime += this.contour_.attackHold;
  this.param_.setValueAtTime(v(this.contour_.attackValue), nextTime);
  nextTime += this.contour_.decayTime;
  this.param_.linearRampToValueAtTime(v(this.contour_.sustainValue), nextTime);
  this.sustainStart_ = nextTime;
}

module.ADSRContourer.prototype.contourOff = function(offTime) {
  var nextTime = offTime;
  if (nextTime < this.sustainStart_)
    nextTime = this.sustainStart_;
  nextTime += this.contour_.sustainHold;
  var v = this.valueFunction_;
  this.param_.setValueAtTime(v(this.contour_.sustainValue), nextTime);
  nextTime += this.contour_.releaseTime;
  this.param_.linearRampToValueAtTime(v(this.contour_.finalValue), nextTime);
}

module.ADSRContourer.prototype.contourFinishTime = function(offTime) {
  var releaseTime = offTime;
  if (this.sustainStart_ > releaseTime)
    releaseTime = this.sustainStart_;
  return releaseTime + this.contour_.sustainHold + this.contour_.releaseTime;
}

////////////////////////////////////////////////////////////////////////////////
// ADSR contoured value
module.ADSRContour = function(contouredValue) {
  this.contouredValue_ = contouredValue;
  this.initialValue = 0;
  this.attackDelay = 0;
  this.attackValue = 1;
  this.attackTime = 0;
  this.attackHold = 0;
  this.decayTime = 0;
  this.sustainValue = 1;
  this.sustainHold = 0;
  this.releaseTime = 0;
  this.finalValue = 0;
}

module.ADSRContour.prototype.addContour = function(valueFunction, param, noteSection) {
  noteSection.addContour(new module.ADSRContourer(this, param, valueFunction));
}

module.ADSRContour.prototype.averageValue = function(valueFunction) {
  return valueFunction(this.sustainValue);
}

////////////////////////////////////////////////////////////////////////////////
// Identifiers for contour types
module.kFlatContour = 'flat';
module.kOscillatingContour = 'oscillating';
module.kADSRContour = 'adsr';

////////////////////////////////////////////////////////////////////////////////
// Contoured value
module.ContouredValue = function(context, isEnvelope) {
  this.isEnvelope = isEnvelope;
  this.context_ = context;
  this.currentContourIdentifier = module.kFlatContour;
  this.contours = [];
  this.contoursByIdentifier = {};
  this.initContour_(module.kFlatContour, new module.FlatContour(this));
  this.initContour_(module.kOscillatingContour, new module.OscillatingContour(this));
  this.initContour_(module.kADSRContour, new module.ADSRContour(this));
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
