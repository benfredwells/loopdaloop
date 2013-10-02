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
// Contour interface
//   addContour = function(valueFunction, param, noteSection)
//   averageValue = function(valueFunction)
//   valueAtTime = function(time, noteOnTime)

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
  this.param_.cancelScheduledValues(offTime);
  this.param_.setValueAtTime(this.param_.value, offTime);
  this.param_.linearRampToValueAtTime(0, offTime + kMinChangeTime);
}

module.BasicEnvelopeContourer.prototype.contourFinishTime = function(offTime) {
  return offTime + kMinChangeTime;
}

////////////////////////////////////////////////////////////////////////////////
// Flat contour
module.FlatContour = function(valueSetting, contouredValue) {
  this.contouredValue_ = contouredValue;
  this.valueSetting = Setting.copyNumber(valueSetting);
}

module.FlatContour.prototype.addContour = function(valueFunction, param, noteSection) {
  var flatValue = valueFunction(this.valueSetting.value);
  if (this.contouredValue_.isEnvelope)
    noteSection.addContour(new module.BasicEnvelopeContourer(param, flatValue));
  else
    param.value = flatValue;
}

module.FlatContour.prototype.averageValue = function(valueFunction) {
  return valueFunction(this.valueSetting.value);
}

module.FlatContour.prototype.valueAtTime = function(time, noteOnTime) {
  return this.valueSetting.value;  
}

module.FlatContour.prototype.releaseTime = function() {
  return kMinChangeTime;
}

////////////////////////////////////////////////////////////////////////////////
// Oscillating contour
module.OscillatingContour = function(valueSetting, contouredValue) {
  this.contouredValue_ = contouredValue;
  this.typeSetting = new Setting.Choice(AudioConstants.kWaveTypes);
  this.minValueSetting = Setting.copyNumber(valueSetting);
  this.maxValueSetting = Setting.copyNumber(valueSetting);
  this.maxValueSetting.value = this.maxValueSetting.max;
  this.minValueSetting.value = this.minValueSetting.min;
  this.frequencySetting = new Setting.Number(0, 100);
}

module.OscillatingContour.prototype.rawCenterValue_ = function() {
  return (this.minValueSetting.value + this.maxValueSetting.value) / 2;
}

module.OscillatingContour.prototype.rawAmplitude_ = function() {
  return (this.maxValueSetting.value - this.minValueSetting.value) / 2;
}

module.OscillatingContour.prototype.addContour = function(valueFunction, param, noteSection) {
  var centerValue = valueFunction(this.rawCenterValue_());
  if (this.contouredValue_.isEnvelope)
    noteSection.addContour(new module.BasicEnvelopeContourer(param, centerValue));
  else
    param.value = centerValue;

  var oscillator = this.contouredValue_.context_.createOscillator();
  oscillator.type = this.typeSetting.value;
  oscillator.frequency.value = this.frequencySetting.value;
  noteSection.addOscillator(oscillator);
  var gain = this.contouredValue_.context_.createGainNode();
  var amplitudeValue = valueFunction(this.rawAmplitude_());
  if (this.contouredValue_.isEnvelope)
    noteSection.addContour(new module.BasicEnvelopeContourer(gain.gain, amplitudeValue));
  else
    gain.gain.value = amplitudeValue;
  noteSection.addNode(gain);
  oscillator.connect(gain);
  gain.connect(param);
}

module.OscillatingContour.prototype.averageValue = function(valueFunction) {
  return valueFunction(this.rawCenterValue_());
}

module.OscillatingContour.prototype.valueAtTime = function(time, noteOnTime) {
  var periods = time * this.frequencySetting.value;
  var periodOffset = periods - Math.floor(periods);
  var factor = 0;
  switch (this.typeSetting.value) {
   case AudioConstants.kSineWave:
    factor = Math.sin(2 * Math.PI * periodOffset);
    break;
   case AudioConstants.kSquareWave:
    if (periodOffset < 0.5)
      factor = 1
    else
      factor = -1;
    break;
   case AudioConstants.kSawtoothWave:
    if (periodOffset < 0.5)
      factor = 2 * periodOffset
    else
      factor = 2 * (periodOffset - 1);
    break;
   case AudioConstants.kTriangleWave:
    if (periodOffset < 0.25)
      factor = 4 * periodOffset
    else if (periodOffset < 0.75)
      factor = 1 - 4 * (periodOffset - 0.25);
    else
      factor = 4 * (periodOffset - 1)
    break;
  }
  return this.rawCenterValue_() + this.rawAmplitude_() * factor;
}

module.OscillatingContour.prototype.releaseTime = function() {
  return kMinChangeTime;
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
  // Envelopes always start at 0, and have no attack delay.
  if (this.contour_.contouredValue_.isEnvelope) {
    this.param_.setValueAtTime(0, nextTime);
  } else {
    this.param_.setValueAtTime(v(this.contour_.initialValueSetting.value), nextTime);
    nextTime += this.contour_.attackDelaySetting.value;
    this.param_.setValueAtTime(v(this.contour_.initialValueSetting.value), nextTime);
  }
  nextTime += this.contour_.attackTimeSetting.value;
  this.param_.linearRampToValueAtTime(v(this.contour_.attackValueSetting.value), nextTime);
  nextTime += this.contour_.attackHoldSetting.value;
  this.param_.setValueAtTime(v(this.contour_.attackValueSetting.value), nextTime);
  nextTime += this.contour_.decayTimeSetting.value;
  this.param_.linearRampToValueAtTime(v(this.contour_.sustainValueSetting.value), nextTime);
}

module.ADSRContourer.prototype.contourOff = function(offTime) {
  var nextTime = offTime;
  this.param_.cancelScheduledValues(offTime);
  this.param_.setValueAtTime(this.param_.value, nextTime);
  nextTime += this.contour_.sustainHoldSetting.value;
  this.param_.setValueAtTime(this.param_.value, nextTime);
  nextTime += this.contour_.releaseTimeSetting.value;
  var finalValue = this.valueFunction_(this.contour_.finalValueSetting.value);
  // Envelopes always finish at 0.
  if (this.contour_.contouredValue_.isEnvelope)
    finalValue = 0;
  this.param_.linearRampToValueAtTime(finalValue, nextTime);
}

module.ADSRContourer.prototype.contourFinishTime = function(offTime) {
  return offTime + this.contour_.sustainHoldSetting.value +
         this.contour_.releaseTimeSetting.value;
}

////////////////////////////////////////////////////////////////////////////////
// ADSR contoured value
module.ADSRContour = function(valueSetting, contouredValue) {
  this.contouredValue_ = contouredValue;
  this.initialValueSetting = Setting.copyNumber(valueSetting);
  this.attackDelaySetting = new Setting.Number(0, 10);
  this.attackTimeSetting = new Setting.Number(kMinChangeTime, 10);
  this.attackValueSetting = Setting.copyNumber(valueSetting);
  this.attackHoldSetting = new Setting.Number(0, 10);
  this.decayTimeSetting = new Setting.Number(kMinChangeTime, 10);
  this.sustainValueSetting = Setting.copyNumber(valueSetting);
  this.sustainHoldSetting = new Setting.Number(0, 1);
  this.releaseTimeSetting = new Setting.Number(kMinChangeTime, 10);
  this.finalValueSetting = Setting.copyNumber(valueSetting);
}

module.ADSRContour.prototype.addContour = function(valueFunction, param, noteSection) {
  noteSection.addContour(new module.ADSRContourer(this, param, valueFunction));
}

module.ADSRContour.prototype.averageValue = function(valueFunction) {
  return valueFunction(this.sustainValueSetting.value);
}

module.ADSRContour.prototype.interpolatedValue_ = function(time, startTime, endTime,
                                                           startValue, endValue) {
  var relTime = (time - startTime) / (endTime - startTime);
  return startValue + (endValue - startValue) * relTime;
}

module.ADSRContour.prototype.onValueAtTime_ = function(time) {
  var nextTime = this.attackDelaySetting.value;
  if (time < nextTime)
    return this.initialValueSetting.value;

  var lastTime = nextTime;
  nextTime += this.attackTimeSetting.value;
  if (time < nextTime)
    return this.interpolatedValue_(time, lastTime, nextTime,
                                   this.initialValueSetting.value, this.attackValueSetting.value);

  nextTime += this.attackHoldSetting.value;
  if (time < nextTime)
    return this.attackValueSetting.value;

  lastTime = nextTime;
  nextTime += this.decayTimeSetting.value;
  if (time < nextTime)
    return this.interpolatedValue_(time, lastTime, nextTime,
                                   this.attackValueSetting.value, this.sustainValueSetting.value);

  return this.sustainValueSetting.value;
}

module.ADSRContour.prototype.valueAtTime = function(time, noteOnTime) {
  if (time <= noteOnTime)
    return this.onValueAtTime_(time);

  var sustainValue = this.onValueAtTime_(noteOnTime);
  var offTime = time - noteOnTime;
  if (offTime < this.sustainHoldSetting.value)
    return sustainValue;

  var finishTime = this.sustainHoldSetting.value + this.releaseTimeSetting.value;
  if (offTime < finishTime)
    return this.interpolatedValue_(offTime, this.sustainHoldSetting.value, finishTime,
                                   sustainValue, this.finalValueSetting.value);

  return this.finalValueSetting.value;
}

module.ADSRContour.prototype.releaseTime = function() {
  return this.sustainHoldSetting.value + this.releaseTimeSetting.value;
}

////////////////////////////////////////////////////////////////////////////////
// Identifiers for contour types
module.kFlatContour = 'flat';
module.kOscillatingContour = 'oscillating';
module.kADSRContour = 'adsr';
module.kContourTypes = [module.kFlatContour, module.kOscillatingContour, module.kADSRContour];

////////////////////////////////////////////////////////////////////////////////
// Contoured value
module.ContouredValue = function(context, valueSetting, isEnvelope) {
  this.isEnvelope = isEnvelope;
  this.min = valueSetting.min;
  this.max = valueSetting.max;
  this.context_ = context;
  this.currentContourSetting = new Setting.Choice(module.kContourTypes);
  this.contours_ = [];
  this.contoursByIdentifier = {};
  this.initContour_(module.kFlatContour, new module.FlatContour(valueSetting, this));
  this.initContour_(module.kOscillatingContour, new module.OscillatingContour(valueSetting, this));
  this.initContour_(module.kADSRContour, new module.ADSRContour(valueSetting, this));
}

module.ContouredValue.prototype.initContour_ = function(identifier, contour) {
  this.contours_.push(contour);
  this.contoursByIdentifier[identifier] = contour;
}

module.ContouredValue.prototype.currentContour = function() {
  return this.contoursByIdentifier[this.currentContourSetting.value];
}

module.ContouredValue.prototype.valueAtTime = function(time, noteOnTime) {
  return this.currentContour().valueAtTime(time, noteOnTime);
}

module.ContouredValue.prototype.releaseTime = function() {
  return this.currentContour().releaseTime();
}

return module;

}());
