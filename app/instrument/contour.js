"use strict";

var Contour = (function() {

var module = {};

var kMinChangeTime = 0.0005;

////////////////////////////////////////////////////////////////////////////////
// Contour settings shared by the different contour types.
var IntermediateContourStage = function(valueSetting) {
  Setting.ListenableGroup.call(this);
  this.beginValueSetting = this.addListenable(valueSetting.copy());
  this.durationSetting = this.addListenable(new Setting.Number(kMinChangeTime, 10));
};

IntermediateContourStage.prototype = Object.create(Setting.ListenableGroup.prototype);

var SharedContourSettings = function(valueSetting) {
  Setting.ListenableGroup.call(this);
  // N Stage settings
  this.initialValueSetting = this.addListenable(valueSetting.copy());
  this.firstStageTimeSetting = this.addListenable(new Setting.Number(kMinChangeTime, 10));
  this.numStagesSetting = this.addListenable(new Setting.Number(AudioConstants.kMinStages, AudioConstants.kMaxStages));
  this.intermediateStages = [];
  for (var i = 0; i < AudioConstants.kMaxIntermediateStageValues; i++) {
    this.intermediateStages.push(this.addListenable(new IntermediateContourStage(valueSetting)));
  }
  this.releaseTimeSetting = this.addListenable(new Setting.Number(kMinChangeTime, 10));
  this.finalValueSetting = (valueSetting.copy());
  // Vanilla oscillation settings
  this.oscillationWaveSetting = this.addListenable(new Setting.Choice(AudioConstants.kWaveTypes));
  this.oscillationMinValueSetting = this.addListenable(valueSetting.copy());
  this.oscillationMaxValueSetting = this.addListenable(valueSetting.copy());
  this.oscillationMaxValueSetting.value = this.oscillationMaxValueSetting.max;
  this.oscillationMinValueSetting.value = this.oscillationMinValueSetting.min;
  // N Stage oscillation settings
  this.oscillationAmountSetting = this.addListenable(new Setting.Number(0, 1));
  // Shared oscillation settings
  this.oscillationFrequencySetting = this.addListenable(new Setting.Number(0, 20));
  this.oscillationTimeConstantSetting = this.addListenable(new Setting.Number(0, 10));
  this.oscillationTypeSetting = this.addListenable(new Setting.Choice(AudioConstants.kOscillationTypes));
  // Sweep settings
  this.sweepTimeSetting = this.addListenable(new Setting.Number(kMinChangeTime, 10));
};

SharedContourSettings.prototype = Object.create(Setting.ListenableGroup.prototype);

////////////////////////////////////////////////////////////////////////////////
// Contourer interface
//   contourOn = function(onTime)
//   contourOff = function(offTime)
//   contourFinishTime = function(offTime) returns time

////////////////////////////////////////////////////////////////////////////////
// Contour interface
//   addContour = function(context, valueFunction, param, noteSection)
//   averageValue = function(valueFunction)
//   valueAtTime = function(time, noteOnTime) - |time| is time from when the
//                                              note starts playing.

////////////////////////////////////////////////////////////////////////////////
// BasicEnvelopeContourer class
module.BasicEnvelopeContourer = function(param, value) {
  this.param_ = param;
  this.value_ = value;
};

module.BasicEnvelopeContourer.prototype.contourOn = function(onTime) {
  this.param_.setValueAtTime(0, onTime);
  this.param_.linearRampToValueAtTime(this.value_, onTime + kMinChangeTime);
};

module.BasicEnvelopeContourer.prototype.contourOff = function(offTime) {
  this.param_.cancelScheduledValues(0);
  this.param_.value = this.param_.value;
  this.param_.setValueAtTime(this.param_.value, offTime);
  this.param_.linearRampToValueAtTime(0, offTime + kMinChangeTime);
};

module.BasicEnvelopeContourer.prototype.contourFinishTime = function(offTime) {
  return offTime + kMinChangeTime;
};

////////////////////////////////////////////////////////////////////////////////
// Flat contour
module.FlatContour = function(sharedSettings, contouredValue) {
  this.contouredValue_ = contouredValue;
  this.valueSetting = sharedSettings.intermediateStages[0].beginValueSetting;
};

module.FlatContour.prototype.addContour = function(context, valueFunction, param, noteSection) {
  var flatValue = valueFunction(this.valueSetting.value);
  if (this.contouredValue_.isEnvelope)
    noteSection.addContour(new module.BasicEnvelopeContourer(param, flatValue));
  else
    param.value = flatValue;
};

module.FlatContour.prototype.averageValue = function(valueFunction) {
  return valueFunction(this.valueSetting.value);
};

module.FlatContour.prototype.valueAtTime = function(time, noteOnTime) {
  return this.valueSetting.value;
};

module.FlatContour.prototype.releaseTime = function() {
  return kMinChangeTime;
};

////////////////////////////////////////////////////////////////////////////////
// Oscillation growth contour
module.OscillationGrowthContourer = function(param, contour) {
  this.param_ = param;
  this.contour_ = contour;
};

module.OscillationGrowthContourer.prototype.contourOn = function(onTime) {
  if (this.contour_.typeSetting.value == AudioConstants.kSwellingOscillation) {
    this.param_.setValueAtTime(0, onTime);
    this.param_.setTargetAtTime(1, onTime, this.contour_.timeConstantSetting.value);
  } else { // must be fading, as constant won't come in here
    this.param_.setValueAtTime(1, onTime);
    this.param_.setTargetAtTime(0, onTime, this.contour_.timeConstantSetting.value);
  }
};

module.OscillationGrowthContourer.prototype.contourOff = function(offTime) {
};

module.OscillationGrowthContourer.prototype.contourFinishTime = function(offTime) {
  return offTime;
};

////////////////////////////////////////////////////////////////////////////////
// Oscillating contour
module.OscillatingContour = function(sharedSettings, contouredValue) {
  this.contouredValue_ = contouredValue;
  this.waveSetting = sharedSettings.oscillationWaveSetting;
  this.minValueSetting = sharedSettings.oscillationMinValueSetting;
  this.maxValueSetting = sharedSettings.oscillationMaxValueSetting;
  this.frequencySetting = sharedSettings.oscillationFrequencySetting;
  this.typeSetting = sharedSettings.oscillationTypeSetting;
  this.timeConstantSetting = sharedSettings.oscillationTimeConstantSetting;
};

module.OscillatingContour.prototype.rawCenterValue_ = function() {
  return (this.minValueSetting.value + this.maxValueSetting.value) / 2;
};

module.OscillatingContour.prototype.rawAmplitude_ = function() {
  return (this.maxValueSetting.value - this.minValueSetting.value) / 2;
};

module.OscillatingContour.prototype.addContour = function(context, valueFunction, param, noteSection) {
  var centerValue = valueFunction(this.rawCenterValue_());
  if (this.contouredValue_.isEnvelope)
    noteSection.addContour(new module.BasicEnvelopeContourer(param, centerValue));
  else
    param.value = centerValue;

  var oscillator = Oscillator.createNode(context, this.waveSetting.value);
  oscillator.frequency.value = this.frequencySetting.value;
  noteSection.addOscillator(oscillator);
  var lastNode = oscillator;
  if (this.typeSetting.value != AudioConstants.kConstantOscillation) {
    var growthGain = context.createGain();
    noteSection.addContour(new module.OscillationGrowthContourer(growthGain.gain, this));
    noteSection.addNode(growthGain);
    oscillator.connect(growthGain);
    lastNode = growthGain;
  }
  var gain = context.createGain();
  var amplitudeValue = (valueFunction(this.maxValueSetting.value) - valueFunction(this.minValueSetting.value)) / 2;
  if (this.contouredValue_.isEnvelope)
    noteSection.addContour(new module.BasicEnvelopeContourer(gain.gain, amplitudeValue));
  else
    gain.gain.value = amplitudeValue;
  noteSection.addNode(gain);
  lastNode.connect(gain);
  gain.connect(param);
};

module.OscillatingContour.prototype.averageValue = function(valueFunction) {
  return valueFunction(this.rawCenterValue_());
};

module.OscillatingContour.prototype.factor_ = function(time) {
  if (this.typeSetting.value == AudioConstants.kConstantOscillation ||
      this.timeConstantSetting.value == 0)
    return 1;

  var factor = Math.exp(-time / this.timeConstantSetting.value);
  if (this.typeSetting.value == AudioConstants.kSwellingOscillation)
    factor = 1 - factor;
  return factor;
};

module.OscillatingContour.prototype.valueAtTime = function(time, noteOnTime) {
  var oscillation = Oscillator.oscillatorValue(this.waveSetting.value, this.frequencySetting.value, time);
  return this.rawCenterValue_() + this.rawAmplitude_() * oscillation * this.factor_(time);
};

module.OscillatingContour.prototype.releaseTime = function() {
  return kMinChangeTime;
};

////////////////////////////////////////////////////////////////////////////////
// n Stage Contourer class
module.NStageContourer = function(contour, param, valueFunction) {
  this.contour_ = contour;
  this.param_ = param;
  this.valueFunction_ = valueFunction;
};

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
};

module.NStageContourer.prototype.contourOff = function(offTime) {
  if (this.contour_.releaseTime() == 0)
    return;

  this.param_.cancelScheduledValues(0);
  this.param_.value = this.param_.value;
  var nextTime = offTime;
  this.param_.setValueAtTime(this.param_.value, nextTime);
  nextTime += this.contour_.releaseTime();
  this.param_.linearRampToValueAtTime(this.valueFunction_(this.contour_.finalValue()), nextTime);
};

module.NStageContourer.prototype.contourFinishTime = function(offTime) {
  return offTime + this.contour_.releaseTime();
};

////////////////////////////////////////////////////////////////////////////////
// n Stage Oscillation Gain Contourer class
module.NStageOscillationGainContourer = function(contour, param) {
  this.contour_ = contour;
  this.param_ = param;
};

module.NStageOscillationGainContourer.prototype.contourOn = function(onTime) {
  this.param_.setValueAtTime(0, onTime);
  this.param_.setTargetAtTime(this.contour_.oscillationAmount(),
                              onTime,
                              this.contour_.oscillationTimeConstant());
};

module.NStageOscillationGainContourer.prototype.contourOff = function(offTime) {
};

module.NStageOscillationGainContourer.prototype.contourFinishTime = function(offTime) {
  return offTime;
};

////////////////////////////////////////////////////////////////////////////////
// Base n Stage contoured value
module.BaseNStageContour = function(sharedSettings, contouredValue) {
  this.contouredValue_ = contouredValue;
  this.initialValueSetting = sharedSettings.initialValueSetting;
  this.finalValueSetting = sharedSettings.finalValueSetting;
};

module.BaseNStageContour.prototype.initialValue = function() {
  if (this.isEnvelope)
    return 0;

  return this.initialValueSetting.value;
};

// Subclasses should override this
module.BaseNStageContour.prototype.firstStageTime = function() {
  return 0;
};

// Subclasses should override this
module.BaseNStageContour.prototype.numIntermediateStages = function() {
  return 0;
};

// Subclasses should override this
module.BaseNStageContour.prototype.intermediateStageBeginValue = function(i) {
  return 0;
};

// Subclasses should override this
module.BaseNStageContour.prototype.intermediateStageDuration = function(i) {
  return 0;
};

// Subclasses should override this
module.BaseNStageContour.prototype.sustainValue = function() {
  return 0;
};

// Subclasses should override this if they have a release
module.BaseNStageContour.prototype.releaseTime = function() {
  return 0;
};

module.BaseNStageContour.prototype.finalValue = function() {
  if (this.isEnvelope)
    return 0;

  return this.finalValueSetting.value;
};

// Subclasses should override this if they oscillate
module.BaseNStageContour.prototype.hasOscillation = function() {
  return false;
}

// Subclasses should override this if they oscillate
module.BaseNStageContour.prototype.oscillationAmount = function() {
  return 0;
};

// Subclasses should override this if they oscillate
module.BaseNStageContour.prototype.oscillationFrequency = function() {
  return 0;
};

// Subclasses should override this if they oscillate
module.BaseNStageContour.prototype.oscillationTimeConstant = function() {
  return 0;
};

module.BaseNStageContour.prototype.addContour = function(context, valueFunction, param, noteSection) {
  noteSection.addContour(new module.NStageContourer(this, param, valueFunction));
  if (!this.hasOscillation())
    return;

  var oscillator = Oscillator.createNode(context, AudioConstants.kSineWave);
  oscillator.frequency.value = this.oscillationFrequency();
  noteSection.addOscillator(oscillator);

  var amplitudeGain = context.createGain();
  noteSection.addContour(new module.NStageOscillationGainContourer(this, amplitudeGain.gain));
  noteSection.addNode(amplitudeGain);
  oscillator.connect(amplitudeGain);

  var envelopeGain = context.createGain();
  noteSection.addContour(new module.NStageContourer(this, envelopeGain.gain, valueFunction));
  noteSection.addNode(envelopeGain);
  amplitudeGain.connect(envelopeGain);
  envelopeGain.connect(param);
};

module.BaseNStageContour.prototype.averageValue = function(valueFunction) {
  return valueFunction(this.sustainValue());
};

module.BaseNStageContour.prototype.interpolatedValue_ = function(time, startTime, endTime,
                                                           startValue, endValue) {
  var relTime = (time - startTime) / (endTime - startTime);
  return startValue + (endValue - startValue) * relTime;
};

// n is zero based
// There is one stage before the intermediate stages
// n = 0 begin value -> intermediate stage 0 end value
module.BaseNStageContour.prototype.nthOnStageEndValue_ = function(n) {
  var result = this.sustainValue()
  if (n < this.numIntermediateStages())
    result = this.intermediateStageBeginValue(n);
  return result;
};

module.BaseNStageContour.prototype.onValueAtTime_ = function(time) {
  var lastTime = 0;
  var nextTime = this.firstStageTime();
  if (time < nextTime) {
    return this.interpolatedValue_(time, lastTime, nextTime,
                                   this.initialValue(), this.nthOnStageEndValue_(0));
  }

  for (var i = 0; i < this.numIntermediateStages(); i++) {
    lastTime = nextTime;
    nextTime += this.intermediateStageDuration(i);
    if (time < nextTime)
      return this.interpolatedValue_(time, lastTime, nextTime,
                                     this.nthOnStageEndValue_(i), this.nthOnStageEndValue_(i + 1));
  }

  return this.sustainValue();
};

module.BaseNStageContour.prototype.oscillationAmount_ = function(time) {
  if (!this.hasOscillation())
    return 0;

  var oscillatorValue = Oscillator.oscillatorValue(AudioConstants.kSineWave, this.oscillationFrequency(), time);
  var amount = this.oscillationAmount() * oscillatorValue;
  var factor = 1;
  if (this.oscillationTimeConstant() > 0)
    factor = factor - Math.exp(-time / this.oscillationTimeConstant());
  return amount * factor;
};

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
};

module.BaseNStageContour.prototype.valueAtTime = function(time, noteOnTime) {
  return this.baseValueAtTime_(time, noteOnTime) * (1 + this.oscillationAmount_(time));
};

////////////////////////////////////////////////////////////////////////////////
// Sweep contoured value
module.SweepContour = function(sharedSettings, contouredValue) {
  module.BaseNStageContour.call(this, sharedSettings, contouredValue);
  this.sweepTimeSetting = sharedSettings.sweepTimeSetting;
  this.finalValueSetting = sharedSettings.intermediateStages[0].beginValueSetting;
};

module.SweepContour.prototype = Object.create(module.BaseNStageContour.prototype);

module.SweepContour.prototype.firstStageTime = function() {
  return this.sweepTimeSetting.value;
};

module.SweepContour.prototype.sustainValue = function() {
  return this.finalValue();
};

module.SweepContour.prototype.numIntermediateStages = function() {
  return 0;
};

////////////////////////////////////////////////////////////////////////////////
// ADSR contoured value
module.ADSRContour = function(sharedSettings, contouredValue) {
  module.BaseNStageContour.call(this, sharedSettings, contouredValue);
  this.attackTimeSetting = sharedSettings.firstStageTimeSetting;
  this.attackValueSetting = sharedSettings.intermediateStages[0].beginValueSetting;
  this.decayTimeSetting = sharedSettings.intermediateStages[0].durationSetting;
  this.sustainValueSetting = sharedSettings.intermediateStages[1].beginValueSetting;
  this.releaseTimeSetting = sharedSettings.releaseTimeSetting;
}
;
module.ADSRContour.prototype = Object.create(module.BaseNStageContour.prototype);

module.ADSRContour.prototype.firstStageTime = function() {
  return this.attackTimeSetting.value;
};

module.ADSRContour.prototype.numIntermediateStages = function() {
  return 1;
};

module.ADSRContour.prototype.intermediateStageBeginValue = function(i) {
  return this.attackValueSetting.value;
};

module.ADSRContour.prototype.intermediateStageDuration = function(i) {
  return this.decayTimeSetting.value;
};

module.ADSRContour.prototype.sustainValue = function() {
  return this.sustainValueSetting.value;
};

module.ADSRContour.prototype.releaseTime = function() {
  return this.releaseTimeSetting.value;
};

////////////////////////////////////////////////////////////////////////////////
// n Stage contoured value
module.NStageContour = function(sharedSettings, contouredValue) {
  module.BaseNStageContour.call(this, sharedSettings, contouredValue);
  this.firstStageTimeSetting = sharedSettings.firstStageTimeSetting;
  this.numStagesSetting = sharedSettings.numStagesSetting;
  this.intermediateStages = [];
  for (var i = 0; i < AudioConstants.kMaxIntermediateStageValues; i++) {
    this.intermediateStages.push(sharedSettings.intermediateStages[i]);
  }
  this.releaseTimeSetting = sharedSettings.releaseTimeSetting;
};

module.NStageContour.prototype = Object.create(module.BaseNStageContour.prototype);

module.NStageContour.prototype.firstStageTime = function() {
  return this.firstStageTimeSetting.value;
};

module.NStageContour.prototype.numIntermediateStages = function() {
  return this.numStagesSetting.value - AudioConstants.kMinStages;
};

module.NStageContour.prototype.intermediateStageBeginValue = function(i) {
  return this.intermediateStages[i].beginValueSetting.value;
};

module.NStageContour.prototype.intermediateStageDuration = function(i) {
  return this.intermediateStages[i].durationSetting.value;
};

module.NStageContour.prototype.sustainValue = function() {
  return this.intermediateStages[this.numIntermediateStages()].beginValueSetting.value;
};

module.NStageContour.prototype.releaseTime = function() {
  return this.releaseTimeSetting.value;
};

////////////////////////////////////////////////////////////////////////////////
// n Stage contoured value
module.NStageOscillatingContour = function(sharedSettings, contouredValue) {
  module.NStageContour.call(this, sharedSettings, contouredValue);
  this.oscillationAmountSetting = sharedSettings.oscillationAmountSetting;
  this.oscillationFrequencySetting = sharedSettings.oscillationFrequencySetting;
  this.oscillationTimeConstantSetting = sharedSettings.oscillationTimeConstantSetting;
};

module.NStageOscillatingContour.prototype = Object.create(module.NStageContour.prototype);

module.NStageOscillatingContour.prototype.hasOscillation = function() {
  return true;
};

module.NStageOscillatingContour.prototype.oscillationAmount = function() {
  return this.oscillationAmountSetting.value;
};

module.NStageOscillatingContour.prototype.oscillationFrequency = function(i) {
  return this.oscillationFrequencySetting.value;
};

module.NStageOscillatingContour.prototype.oscillationTimeConstant = function(i) {
  return this.oscillationTimeConstantSetting.value;
};

////////////////////////////////////////////////////////////////////////////////
// Contoured value
module.ContouredValue = function(valueSetting, isEnvelope) {
  Setting.ListenableGroup.call(this);
  this.isEnvelope = isEnvelope;
  this.min = valueSetting.min;
  this.max = valueSetting.max;
  this.sharedContourSettings = this.addListenable(new SharedContourSettings(valueSetting));
  if (isEnvelope)
    this.currentContourSetting = this.addListenable(new Setting.Choice(AudioConstants.kEnvelopeContourTypes));
  else
    this.currentContourSetting = this.addListenable(new Setting.Choice(AudioConstants.kContourTypes));
  this.contours_ = [];
  this.contoursByIdentifier = {};
  this.initContour_(AudioConstants.kFlatContour, new module.FlatContour(this.sharedContourSettings, this));
  this.initContour_(AudioConstants.kOscillatingContour, new module.OscillatingContour(this.sharedContourSettings, this));
  this.initContour_(AudioConstants.kADSRContour, new module.ADSRContour(this.sharedContourSettings, this));
  this.initContour_(AudioConstants.kNStageContour, new module.NStageContour(this.sharedContourSettings, this));
  this.initContour_(AudioConstants.kNStageOscillatingContour, new module.NStageOscillatingContour(this.sharedContourSettings, this));
  if (!isEnvelope)
    this.initContour_(AudioConstants.kSweepContour, new module.SweepContour(this.sharedContourSettings, this));
};

module.ContouredValue.prototype = Object.create(Setting.ListenableGroup.prototype);

module.ContouredValue.prototype.initContour_ = function(identifier, contour) {
  this.contours_.push(contour);
  this.contoursByIdentifier[identifier] = contour;
};

module.ContouredValue.prototype.currentContour = function() {
  return this.contoursByIdentifier[this.currentContourSetting.value];
};

module.ContouredValue.prototype.valueAtTime = function(time, noteOnTime) {
  return this.currentContour().valueAtTime(time, noteOnTime);
};

module.ContouredValue.prototype.releaseTime = function() {
  return this.currentContour().releaseTime();
};

return module;

}());
