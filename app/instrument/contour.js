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
  // Vanilla oscillation settings
  this.oscillationTypeSetting = new Setting.Choice(AudioConstants.kWaveTypes);
  this.oscillationMinValueSetting = Setting.copyNumber(valueSetting);
  this.oscillationMaxValueSetting = Setting.copyNumber(valueSetting);
  this.oscillationMaxValueSetting.value = this.oscillationMaxValueSetting.max;
  this.oscillationMinValueSetting.value = this.oscillationMinValueSetting.min;
  // N Stage oscillation settings
  this.oscillationAmountSetting = new Setting.Number(0, 1);
  this.oscillationTimeConstantSetting = new Setting.Number(0, 10);
  // Shared oscillation settings
  this.oscillationFrequencySetting = new Setting.Number(0, 20);
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
  this.param_.cancelScheduledValues(0);
  this.param_.value = this.param_.value;
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
  this.param_.setValueAtTime(v(this.contour_.initialValue()), nextTime);
  nextTime += this.contour_.firstStageTime();
  for (var i = 0; i < this.contour_.numIntermediateStages(); i++) {
    var stageBegin = this.contour_.intermediateStageBeginValue(i);
    var stageDuration = this.contour_.intermediateStageDuration(i);
    this.param_.linearRampToValueAtTime(v(stageBegin), nextTime);
    nextTime += stageDuration;
  }
  this.param_.linearRampToValueAtTime(v(this.contour_.sustainValue()), nextTime);
}

module.NStageContourer.prototype.contourOff = function(offTime) {
  this.param_.cancelScheduledValues(0);
  this.param_.value = this.param_.value;
  var nextTime = offTime;
  this.param_.setValueAtTime(this.param_.value, nextTime);
  nextTime += this.contour_.releaseTime();
  this.param_.linearRampToValueAtTime(this.valueFunction_(this.contour_.finalValue()), nextTime);
}

module.NStageContourer.prototype.contourFinishTime = function(offTime) {
  return offTime + this.contour_.releaseTime();
}

////////////////////////////////////////////////////////////////////////////////
// n Stage Oscillation Gain Contourer class
module.NStageOscillationGainContourer = function(contour, param) {
  this.contour_ = contour;
  this.param_ = param;
}

module.NStageOscillationGainContourer.prototype.contourOn = function(onTime) {
  this.param_.setValueAtTime(0, onTime);
  this.param_.setTargetAtTime(this.contour_.oscillationAmount(),
                              onTime,
                              this.contour_.oscillationTimeConstant());
}

module.NStageOscillationGainContourer.prototype.contourOff = function(offTime) {
}

module.NStageOscillationGainContourer.prototype.contourFinishTime = function(offTime) {
  return offTime;
}

////////////////////////////////////////////////////////////////////////////////
// Base n Stage contoured value
module.BaseNStageContour = function(sharedSettings, contouredValue) {
  this.contouredValue_ = contouredValue;
  this.initialValueSetting = sharedSettings.initialValueSetting;
  this.sustainValueSetting = sharedSettings.sustainValueSetting;
}

module.BaseNStageContour.prototype.initialValue = function() {
  if (this.isEnvelope)
    return 0;

  return this.initialValueSetting.value;
}

// Subclasses should override this
module.BaseNStageContour.prototype.firstStageTime = function() {
  return 0;
}

// Subclasses should override this
module.BaseNStageContour.prototype.numIntermediateStages = function() {
  return 0;
}

// Subclasses should override this
module.BaseNStageContour.prototype.intermediateStageBeginValue = function(i) {
  return 0;
}

// Subclasses should override this
module.BaseNStageContour.prototype.intermediateStageDuration = function(i) {
  return 0;
}

module.BaseNStageContour.prototype.sustainValue = function() {
  return this.sustainValueSetting.value;
}

// Subclasses should override this if they have a release
module.BaseNStageContour.prototype.releaseTime = function() {
  return 0;
}

// Subclasses should override this if they have a release
module.BaseNStageContour.prototype.finalValue = function() {
  return this.sustainValue();
}

// Subclasses should override this if they oscillate
module.BaseNStageContour.prototype.hasOscillation = function() {
  return false;
}

// Subclasses should override this if they oscillate
module.BaseNStageContour.prototype.oscillationAmount = function() {
  return 0;
}

// Subclasses should override this if they oscillate
module.BaseNStageContour.prototype.oscillationFrequency = function() {
  return 0;
}

// Subclasses should override this if they oscillate
module.BaseNStageContour.prototype.oscillationTimeConstant = function() {
  return 0;
}

module.BaseNStageContour.prototype.addContour = function(valueFunction, param, noteSection) {
  noteSection.addContour(new module.NStageContourer(this, param, valueFunction));
  if (!this.hasOscillation())
    return;

  var oscillator = this.contouredValue_.context_.createOscillator();
  oscillator.type = AudioConstants.kSineWave;
  oscillator.frequency.value = this.oscillationFrequency();
  noteSection.addOscillator(oscillator);

  var amplitudeGain = this.contouredValue_.context_.createGainNode();
  noteSection.addContour(new module.NStageOscillationGainContourer(this, amplitudeGain.gain));
  noteSection.addNode(amplitudeGain);
  oscillator.connect(amplitudeGain);

  var envelopeGain = this.contouredValue_.context_.createGainNode();
  noteSection.addContour(new module.NStageContourer(this, envelopeGain.gain, valueFunction));
  noteSection.addNode(envelopeGain);
  amplitudeGain.connect(envelopeGain);
  envelopeGain.connect(param);
}

module.BaseNStageContour.prototype.averageValue = function(valueFunction) {
  return valueFunction(this.sustainValue());
}

module.BaseNStageContour.prototype.interpolatedValue_ = function(time, startTime, endTime,
                                                           startValue, endValue) {
  var relTime = (time - startTime) / (endTime - startTime);
  return startValue + (endValue - startValue) * relTime;
}

// n is zero based
// There is one stage before the intermediate stages
// n = 0 begin value -> intermediate stage 0 end value
module.BaseNStageContour.prototype.nthOnStageEndValue_ = function(n) {
  var result = this.sustainValue()
  if (n < this.numIntermediateStages())
    result = this.intermediateStageBeginValue(n);
  return result;
}

module.BaseNStageContour.prototype.onValueAtTime_ = function(time) {
  var lastTime = 0;
  var nextTime = this.firstStageTime();
  if (time < nextTime)
    return this.interpolatedValue_(time, lastTime, nextTime,
                                   this.initialValue(), this.nthOnStageEndValue_(0));

  for (var i = 0; i < this.numIntermediateStages(); i++) {
    lastTime = nextTime;
    nextTime += this.intermediateStageDuration(i);
    if (time < nextTime)
      return this.interpolatedValue_(time, lastTime, nextTime,
                                     this.nthOnStageEndValue_(i), this.nthOnStageEndValue_(i + 1));
  }

  return this.sustainValue();
}

module.BaseNStageContour.prototype.oscillationAmount_ = function(time) {
  if (!this.hasOscillation())
    return 0;

  var periods = time * this.oscillationFrequency();
  var periodOffset = periods - Math.floor(periods);
  var amount = this.oscillationAmount() * Math.sin(2 * Math.PI * periodOffset);
  var factor = 1;
  if (this.oscillationTimeConstant() > 0)
    factor = factor - Math.exp(-time / this.oscillationTimeConstant());
  return amount * factor;
}

module.BaseNStageContour.prototype.baseValueAtTime_ = function(time, noteOnTime) {
  if (time <= noteOnTime)
    return this.onValueAtTime_(time);

  var sustainValue = this.onValueAtTime_(noteOnTime);
  var offTime = time - noteOnTime;
  var finishTime = this.releaseTime();
  if (offTime < finishTime)
    return this.interpolatedValue_(offTime, 0, finishTime,
                                   sustainValue, this.finalValue());

  return this.finalValue();
}

module.BaseNStageContour.prototype.valueAtTime = function(time, noteOnTime) {
  return this.baseValueAtTime_(time, noteOnTime) * (1 + this.oscillationAmount_(time));
}

////////////////////////////////////////////////////////////////////////////////
// ADSR contoured value
module.ADSRContour = function(sharedSettings, contouredValue) {
  module.BaseNStageContour.call(this, sharedSettings, contouredValue);
  this.attackTimeSetting = sharedSettings.firstStageTimeSetting;
  this.attackValueSetting = sharedSettings.intermediateStages[0].beginValueSetting;
  this.decayTimeSetting = sharedSettings.intermediateStages[0].durationSetting;
  this.releaseTimeSetting = sharedSettings.releaseTimeSetting;
  this.finalValueSetting = sharedSettings.finalValueSetting;
}

module.ADSRContour.prototype = Object.create(module.BaseNStageContour.prototype);

module.ADSRContour.prototype.firstStageTime = function() {
  return this.attackTimeSetting.value;
}

module.ADSRContour.prototype.numIntermediateStages = function() {
  return 1;
}

module.ADSRContour.prototype.intermediateStageBeginValue = function(i) {
  return this.attackValueSetting.value;
}

module.ADSRContour.prototype.intermediateStageDuration = function(i) {
  return this.decayTimeSetting.value;
}

// Subclasses should override this if they have a release
module.ADSRContour.prototype.releaseTime = function() {
  return this.releaseTimeSetting.value;
}

// Subclasses should override this if they have a release
module.ADSRContour.prototype.finalValue = function() {
  if (this.isEnvelope)
    return 0;

  return this.finalValueSetting.value;
}

////////////////////////////////////////////////////////////////////////////////
// n Stage contoured value
module.NStageContour = function(sharedSettings, contouredValue) {
  module.BaseNStageContour.call(this, sharedSettings, contouredValue);
  this.firstStageTimeSetting = sharedSettings.firstStageTimeSetting;
  this.numStagesSetting = sharedSettings.numStagesSetting;
  this.intermediateStages = [];
  for (var i = 0; i < module.kMaxIntermediateStages; i++) {
    this.intermediateStages.push(sharedSettings.intermediateStages[i]);
  }
  this.releaseTimeSetting = sharedSettings.releaseTimeSetting;
  this.finalValueSetting = sharedSettings.finalValueSetting;
}

module.NStageContour.prototype = Object.create(module.BaseNStageContour.prototype);

module.NStageContour.prototype.firstStageTime = function() {
  return this.firstStageTimeSetting.value;
}

module.NStageContour.prototype.numIntermediateStages = function() {
  return this.numStagesSetting.value - module.kMinStages;
}

module.NStageContour.prototype.intermediateStageBeginValue = function(i) {
  return this.intermediateStages[i].beginValueSetting.value;
}

module.NStageContour.prototype.intermediateStageDuration = function(i) {
  return this.intermediateStages[i].durationSetting.value;
}

// Subclasses should override this if they have a release
module.NStageContour.prototype.releaseTime = function() {
  return this.releaseTimeSetting.value;
}

// Subclasses should override this if they have a release
module.NStageContour.prototype.finalValue = function() {
  if (this.isEnvelope)
    return 0;

  return this.finalValueSetting.value;
}

////////////////////////////////////////////////////////////////////////////////
// n Stage contoured value
module.NStageOscillatingContour = function(sharedSettings, contouredValue) {
  module.NStageContour.call(this, sharedSettings, contouredValue);
  this.oscillationAmountSetting = sharedSettings.oscillationAmountSetting;
  this.oscillationFrequencySetting = sharedSettings.oscillationFrequencySetting;
  this.oscillationTimeConstantSetting = sharedSettings.oscillationTimeConstantSetting;
}

module.NStageOscillatingContour.prototype = Object.create(module.NStageContour.prototype);

module.NStageOscillatingContour.prototype.hasOscillation = function() {
  return true;
}

module.NStageOscillatingContour.prototype.oscillationAmount = function() {
  return this.oscillationAmountSetting.value;
}

module.NStageOscillatingContour.prototype.oscillationFrequency = function(i) {
  return this.oscillationFrequencySetting.value;
}

module.NStageOscillatingContour.prototype.oscillationTimeConstant = function(i) {
  return this.oscillationTimeConstantSetting.value;
}

////////////////////////////////////////////////////////////////////////////////
// Identifiers for contour types
module.kFlatContour = 'flat';
module.kOscillatingContour = 'oscillating';
module.kADSRContour = 'adsr';
module.kNStageContour = 'nstage';
module.kNStageOscillatingContour = 'nstageoscillating';
module.kContourTypes = [module.kFlatContour,
                        module.kOscillatingContour,
                        module.kADSRContour,
                        module.kNStageContour,
                        module.kNStageOscillatingContour];

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
  this.initContour_(module.kNStageOscillatingContour, new module.NStageOscillatingContour(this.sharedContourSettings, this));
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
