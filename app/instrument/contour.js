Contour = (function() {

"use strict";
var module = {};

var kMinChangeTime = 0.05;

module.kMaxIntermediateStages = 5;
module.kMinStages = 3;
module.kMaxStages = module.kMinStages + module.kMaxIntermediateStages;

////////////////////////////////////////////////////////////////////////////////
// Contour settings shared by the different contour types.
var IntermediateContourStage = function(valueSetting) {
  this.beginValueSetting = Setting.copyNumber(valueSetting);
  this.durationSetting = new Setting.Number(kMinChangeTime, 10);
}

var SharedContourSettings = function(valueSetting) {
  // N Stage settings
  this.initialValueSetting = Setting.copyNumber(valueSetting);
  this.firstStageTimeSetting = new Setting.Number(kMinChangeTime, 10);
  this.numStagesSetting = new Setting.Number(module.kMinStages, module.kMaxStages);
  this.intermediateStages = [];
  for (var i = 0; i < module.kMaxIntermediateStages; i++) {
    this.intermediateStages.push(new IntermediateContourStage(valueSetting));
  }
  this.sustainValueSetting = Setting.copyNumber(valueSetting);
  this.releaseTimeSetting = new Setting.Number(kMinChangeTime, 10);
  this.finalValueSetting = Setting.copyNumber(valueSetting);
  // Oscillation settings
  this.oscillationTypeSetting = new Setting.Choice(AudioConstants.kWaveTypes);
  this.oscillationMinValueSetting = Setting.copyNumber(valueSetting);
  this.oscillationMaxValueSetting = Setting.copyNumber(valueSetting);
  this.oscillationMaxValueSetting.value = this.oscillationMaxValueSetting.max;
  this.oscillationMinValueSetting.value = this.oscillationMinValueSetting.min;
  this.oscillationFrequencySetting = new Setting.Number(0, 100);
}

////////////////////////////////////////////////////////////////////////////////
// Contourer interface
//   contourOn = function(onTime)
//   contourOff = function(offTime)
//   contourFinishTime = function(offTime) returns time

////////////////////////////////////////////////////////////////////////////////
// Contour interface
//   addContour = function(valueFunction, param, noteSection)
//   averageValue = function(valueFunction)
//   valueAtTime = function(time, noteOnTime) - |time| is time from when the
//                                              note starts playing.

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
module.FlatContour = function(sharedSettings, contouredValue) {
  this.contouredValue_ = contouredValue;
  this.valueSetting = sharedSettings.sustainValueSetting;
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
module.OscillatingContour = function(sharedSettings, contouredValue) {
  this.contouredValue_ = contouredValue;
  this.typeSetting = sharedSettings.oscillationTypeSetting;
  this.minValueSetting = sharedSettings.oscillationMinValueSetting;
  this.maxValueSetting = sharedSettings.oscillationMaxValueSetting;
  this.frequencySetting = sharedSettings.oscillationFrequencySetting;
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
// n Stage Contourer class
module.NStageContourer = function(contour, param, valueFunction) {
  this.contour_ = contour;
  this.param_ = param;
  this.valueFunction_ = valueFunction;
}

module.NStageContourer.prototype.contourOn = function(onTime) {
  var nextTime = onTime;
  var v = this.valueFunction_;
  this.param_.setValueAtTime(v(this.contour_.initialValue_()), nextTime);
  nextTime += this.contour_.firstStageTimeSetting.value;
  for (var i = 0; i < this.contour_.numIntermediateStages(); i++) {
    var stage = this.contour_.intermediateStages[i];
    this.param_.linearRampToValueAtTime(v(stage.beginValueSetting.value), nextTime);
    nextTime += stage.durationSetting.value;
  }
  this.param_.linearRampToValueAtTime(v(this.contour_.sustainValueSetting.value), nextTime);
}

module.NStageContourer.prototype.contourOff = function(offTime) {
  var nextTime = offTime;
  this.param_.cancelScheduledValues(offTime);
  this.param_.setValueAtTime(this.param_.value, nextTime);
  nextTime += this.contour_.releaseTimeSetting.value;
  this.param_.linearRampToValueAtTime(this.valueFunction_(this.contour_.finalValue_()), nextTime);
}

module.NStageContourer.prototype.contourFinishTime = function(offTime) {
  return offTime + this.contour_.releaseTimeSetting.value;
}

////////////////////////////////////////////////////////////////////////////////
// Base n Stage contoured value
module.BaseNStageContour.prototype.numIntermediateStages = function() {
  this.contouredValue_ = contouredValue;
  this.initialValueSetting = sharedSettings.initialValueSetting;
  this.firstStageTimeSetting = sharedSettings.firstStageTimeSetting;
  this.numStagesSetting = sharedSettings.numStagesSetting;
  this.intermediateStages = [];
  for (var i = 0; i < module.kMaxIntermediateStages; i++) {
    this.intermediateStages.push(sharedSettings.intermediateStages[i]);
  }
  this.sustainValueSetting = sharedSettings.sustainValueSetting;
  this.releaseTimeSetting = sharedSettings.releaseTimeSetting;
  this.finalValueSetting = sharedSettings.finalValueSetting;
}

module.BaseNStageContour.prototype.numIntermediateStages = function() {
  return this.numStagesSetting.value - module.kMinStages;
}

module.BaseNStageContour.prototype.addContour = function(valueFunction, param, noteSection) {
  noteSection.addContour(new module.NStageContourer(this, param, valueFunction));
}

module.BaseNStageContour.prototype.averageValue = function(valueFunction) {
  return valueFunction(this.sustainValueSetting.value);
}

module.BaseNStageContour.prototype.interpolatedValue_ = function(time, startTime, endTime,
                                                           startValue, endValue) {
  var relTime = (time - startTime) / (endTime - startTime);
  return startValue + (endValue - startValue) * relTime;
}

module.BaseNStageContour.prototype.initialValue_ = function() {
  if (this.isEnvelope)
    return 0;

  return this.initialValueSetting.value;
}

module.BaseNStageContour.prototype.finalValue_ = function() {
  if (this.isEnvelope)
    return 0;

  return this.finalValueSetting.value;
}

// n is zero based
// There is one stage before the intermediate stages
// n = 0 begin value -> intermediate stage 0 end value
module.BaseNStageContour.prototype.nthOnStageEndValue_ = function(n) {
  var result = this.sustainValueSetting.value;
  if (n < this.numIntermediateStages())
    result = this.intermediateStages[n].beginValueSetting.value;
  return result;
}

module.BaseNStageContour.prototype.onValueAtTime_ = function(time) {
  var lastTime = 0;
  var nextTime = this.firstStageTimeSetting.value;
  if (time < nextTime)
    return this.interpolatedValue_(time, lastTime, nextTime,
                                   this.initialValue_(), this.nthOnStageEndValue_(0));

  for (var i = 0; i < this.numIntermediateStages(); i++) {
    lastTime = nextTime;
    nextTime += this.intermediateStages[i].durationSetting.value;
    if (time < nextTime)
      return this.interpolatedValue_(time, lastTime, nextTime,
                                     this.nthOnStageEndValue_(i), this.nthOnStageEndValue_(i + 1));
  }

  return this.sustainValueSetting.value;
}

module.BaseNStageContour.prototype.valueAtTime = function(time, noteOnTime) {
  if (time <= noteOnTime)
    return this.onValueAtTime_(time);

  var sustainValue = this.onValueAtTime_(noteOnTime);
  var offTime = time - noteOnTime;
  var finishTime = this.releaseTimeSetting.value;
  if (offTime < finishTime)
    return this.interpolatedValue_(offTime, 0, finishTime,
                                   sustainValue, this.finalValue_());

  return this.finalValue_();
}

module.BaseNStageContour.prototype.releaseTime = function() {
  return this.releaseTimeSetting.value;
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
  // Envelopes have no attack delay.
  this.param_.setValueAtTime(v(this.contour_.initialValue_()), nextTime);
  nextTime += this.contour_.attackTimeSetting.value;
  this.param_.linearRampToValueAtTime(v(this.contour_.attackValueSetting.value), nextTime);
  nextTime += this.contour_.decayTimeSetting.value;
  this.param_.linearRampToValueAtTime(v(this.contour_.sustainValueSetting.value), nextTime);
}

module.ADSRContourer.prototype.contourOff = function(offTime) {
  var nextTime = offTime;
  this.param_.cancelScheduledValues(offTime);
  this.param_.setValueAtTime(this.param_.value, nextTime);
  nextTime += this.contour_.releaseTimeSetting.value;
  this.param_.linearRampToValueAtTime(this.valueFunction_(this.contour_.finalValue_()), nextTime);
}

module.ADSRContourer.prototype.contourFinishTime = function(offTime) {
  return offTime + this.contour_.releaseTimeSetting.value;
}

////////////////////////////////////////////////////////////////////////////////
// ADSR contoured value
module.ADSRContour = function(sharedSettings, contouredValue) {
  this.contouredValue_ = contouredValue;
  this.initialValueSetting = sharedSettings.initialValueSetting;
  this.attackTimeSetting = sharedSettings.firstStageTimeSetting;
  this.attackValueSetting = sharedSettings.intermediateStages[0].beginValueSetting;
  this.decayTimeSetting = sharedSettings.intermediateStages[0].durationSetting;
  this.sustainValueSetting = sharedSettings.sustainValueSetting;
  this.releaseTimeSetting = sharedSettings.releaseTimeSetting;
  this.finalValueSetting = sharedSettings.finalValueSetting;
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

module.ADSRContour.prototype.initialValue_ = function() {
  if (this.isEnvelope)
    return 0;

  return this.initialValueSetting.value;
}

module.ADSRContour.prototype.finalValue_ = function() {
  if (this.isEnvelope)
    return 0;

  return this.finalValueSetting.value;
}

module.ADSRContour.prototype.onValueAtTime_ = function(time) {
  var nextTime = this.attackTimeSetting.value;
  if (time < nextTime)
    return this.interpolatedValue_(time, 0, nextTime,
                                   this.initialValue_(), this.attackValueSetting.value);

  var lastTime = nextTime;
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
  var finishTime = noteOnTime + this.releaseTimeSetting.value;
  if (time < finishTime)
    return this.interpolatedValue_(time, noteOnTime, finishTime,
                                   sustainValue, this.finalValue_());

  return this.finalValue_();
}

module.ADSRContour.prototype.releaseTime = function() {
  return this.releaseTimeSetting.value;
}

////////////////////////////////////////////////////////////////////////////////
// n Stage Contourer class
module.NStageContourer = function(contour, param, valueFunction) {
  this.contour_ = contour;
  this.param_ = param;
  this.valueFunction_ = valueFunction;
}

module.NStageContourer.prototype.contourOn = function(onTime) {
  var nextTime = onTime;
  var v = this.valueFunction_;
  this.param_.setValueAtTime(v(this.contour_.initialValue_()), nextTime);
  nextTime += this.contour_.firstStageTimeSetting.value;
  for (var i = 0; i < this.contour_.numIntermediateStages(); i++) {
    var stage = this.contour_.intermediateStages[i];
    this.param_.linearRampToValueAtTime(v(stage.beginValueSetting.value), nextTime);
    nextTime += stage.durationSetting.value;
  }
  this.param_.linearRampToValueAtTime(v(this.contour_.sustainValueSetting.value), nextTime);
}

module.NStageContourer.prototype.contourOff = function(offTime) {
  var nextTime = offTime;
  this.param_.cancelScheduledValues(offTime);
  this.param_.setValueAtTime(this.param_.value, nextTime);
  nextTime += this.contour_.releaseTimeSetting.value;
  this.param_.linearRampToValueAtTime(this.valueFunction_(this.contour_.finalValue_()), nextTime);
}

module.NStageContourer.prototype.contourFinishTime = function(offTime) {
  return offTime + this.contour_.releaseTimeSetting.value;
}

////////////////////////////////////////////////////////////////////////////////
// n Stage contoured value
module.NStageContour = function(sharedSettings, contouredValue) {
  this.contouredValue_ = contouredValue;
  this.initialValueSetting = sharedSettings.initialValueSetting;
  this.firstStageTimeSetting = sharedSettings.firstStageTimeSetting;
  this.numStagesSetting = sharedSettings.numStagesSetting;
  this.intermediateStages = [];
  for (var i = 0; i < module.kMaxIntermediateStages; i++) {
    this.intermediateStages.push(sharedSettings.intermediateStages[i]);
  }
  this.sustainValueSetting = sharedSettings.sustainValueSetting;
  this.releaseTimeSetting = sharedSettings.releaseTimeSetting;
  this.finalValueSetting = sharedSettings.finalValueSetting;
}

module.NStageContour.prototype.numIntermediateStages = function() {
  return this.numStagesSetting.value - module.kMinStages;
}

module.NStageContour.prototype.addContour = function(valueFunction, param, noteSection) {
  noteSection.addContour(new module.NStageContourer(this, param, valueFunction));
}

module.NStageContour.prototype.averageValue = function(valueFunction) {
  return valueFunction(this.sustainValueSetting.value);
}

module.NStageContour.prototype.interpolatedValue_ = function(time, startTime, endTime,
                                                           startValue, endValue) {
  var relTime = (time - startTime) / (endTime - startTime);
  return startValue + (endValue - startValue) * relTime;
}

module.NStageContour.prototype.initialValue_ = function() {
  if (this.isEnvelope)
    return 0;

  return this.initialValueSetting.value;
}

module.NStageContour.prototype.finalValue_ = function() {
  if (this.isEnvelope)
    return 0;

  return this.finalValueSetting.value;
}

// n is zero based
// There is one stage before the intermediate stages
// n = 0 begin value -> intermediate stage 0 end value
module.NStageContour.prototype.nthOnStageEndValue_ = function(n) {
  var result = this.sustainValueSetting.value;
  if (n < this.numIntermediateStages())
    result = this.intermediateStages[n].beginValueSetting.value;
  return result;
}

module.NStageContour.prototype.onValueAtTime_ = function(time) {
  var lastTime = 0;
  var nextTime = this.firstStageTimeSetting.value;
  if (time < nextTime)
    return this.interpolatedValue_(time, lastTime, nextTime,
                                   this.initialValue_(), this.nthOnStageEndValue_(0));

  for (var i = 0; i < this.numIntermediateStages(); i++) {
    lastTime = nextTime;
    nextTime += this.intermediateStages[i].durationSetting.value;
    if (time < nextTime)
      return this.interpolatedValue_(time, lastTime, nextTime,
                                     this.nthOnStageEndValue_(i), this.nthOnStageEndValue_(i + 1));
  }

  return this.sustainValueSetting.value;
}

module.NStageContour.prototype.valueAtTime = function(time, noteOnTime) {
  if (time <= noteOnTime)
    return this.onValueAtTime_(time);

  var sustainValue = this.onValueAtTime_(noteOnTime);
  var offTime = time - noteOnTime;
  var finishTime = this.releaseTimeSetting.value;
  if (offTime < finishTime)
    return this.interpolatedValue_(offTime, 0, finishTime,
                                   sustainValue, this.finalValue_());

  return this.finalValue_();
}

module.NStageContour.prototype.releaseTime = function() {
  return this.releaseTimeSetting.value;
}

////////////////////////////////////////////////////////////////////////////////
// Identifiers for contour types
module.kFlatContour = 'flat';
module.kOscillatingContour = 'oscillating';
module.kADSRContour = 'adsr'
;
module.kNStageContour = 'nstage';
module.kContourTypes = [module.kFlatContour, module.kOscillatingContour, module.kADSRContour, module.kNStageContour];

////////////////////////////////////////////////////////////////////////////////
// Contoured value
module.ContouredValue = function(context, valueSetting, isEnvelope) {
  this.isEnvelope = isEnvelope;
  this.min = valueSetting.min;
  this.max = valueSetting.max;
  this.sharedContourSettings = new SharedContourSettings(valueSetting);
  this.context_ = context;
  this.currentContourSetting = new Setting.Choice(module.kContourTypes);
  this.contours_ = [];
  this.contoursByIdentifier = {};
  this.initContour_(module.kFlatContour, new module.FlatContour(this.sharedContourSettings, this));
  this.initContour_(module.kOscillatingContour, new module.OscillatingContour(this.sharedContourSettings, this));
  this.initContour_(module.kADSRContour, new module.ADSRContour(this.sharedContourSettings, this));
  this.initContour_(module.kNStageContour, new module.NStageContour(this.sharedContourSettings, this));
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
