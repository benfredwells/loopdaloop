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

module.FlatContouredValue.prototype.averageValue = function(valueFunction) {
  return valueFunction(this.value);
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

module.OscillatingContouredValue.prototype.averageValue = function(valueFunction) {
  return valueFunction(this.centerValue);
}

////////////////////////////////////////////////////////////////////////////////
// ADSRContourer class
module.ADSRContourer = function(context, ADSR, param, valueFunction) {
  this.context_ = context;
  this.ADSR_ = ADSR;
  this.param_ = param;
  this.valueFunction_ = valueFunction;
}

module.ADSRContourer.prototype.contourOn = function(onTime) {
  var nextTime = onTime;
  var v = this.valueFunction_;
  this.param_.setValueAtTime(v(this.ADSR_.initialValue), nextTime);
  nextTime += this.ADSR_.attackDelay;
  this.param_.setValueAtTime(v(this.ADSR_.initialValue), nextTime);
  nextTime += this.ADSR_.attackTime;
  this.param_.linearRampToValueAtTime(v(this.ADSR_.attackValue), nextTime);
  nextTime += this.ADSR_.attackHold;
  this.param_.setValueAtTime(v(this.ADSR_.attackValue), nextTime);
  nextTime += this.ADSR_.decayTime;
  this.param_.linearRampToValueAtTime(v(this.ADSR_.sustainValue), nextTime);
  this.sustainStart_ = nextTime;
}

module.ADSRContourer.prototype.contourOff = function(offTime) {
  var nextTime = offTime;
  if (nextTime < this.sustainStart_)
    nextTime = this.sustainStart_;
  nextTime += this.ADSR_.sustainHold;
  var v = this.valueFunction_;
  this.param_.setValueAtTime(v(this.ADSR_.sustainValue), nextTime);
  nextTime += this.ADSR_.releaseTime;
  this.param_.linearRampToValueAtTime(v(this.ADSR_.finalValue), nextTime);
}

module.ADSRContourer.prototype.contourFinishTime = function(offTime) {
  var releaseTime = offTime;
  if (this.sustainStart_ > releaseTime)
    releaseTime = this.sustainStart_;
  return releaseTime + this.ADSR_.sustainHold + this.ADSR_.releaseTime;
}

////////////////////////////////////////////////////////////////////////////////
// ADSR contoured value
module.ADSRContouredValue = function(context) {
  this.context_ = context;
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

module.ADSRContouredValue.prototype.addContour = function(valueFunction, param, noteSection) {
  noteSection.addContour(new module.ADSRContourer(this.context_, this, param, valueFunction));
}

module.ADSRContouredValue.prototype.averageValue = function(valueFunction) {
  return valueFunction(this.sustainValue);
}

////////////////////////////////////////////////////////////////////////////////
// Identifiers for contour types
module.kFlatContour = 'flat';
module.kOscillatingContour = 'oscillating';
module.kADSRContour = 'adsr';

////////////////////////////////////////////////////////////////////////////////
// Contoured value
module.ContouredValue = function(context) {
  this.currentContourIdentifier = module.kFlatContour;
  this.contours = [];
  this.contoursByIdentifier = {};
  this.initContour_(module.kFlatContour, new module.FlatContouredValue());
  this.initContour_(module.kOscillatingContour, new module.OscillatingContouredValue(context));
  this.initContour_(module.kADSRContour, new module.ADSRContouredValue(context));
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
