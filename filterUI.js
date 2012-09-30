FilterUI = (function() {

"use strict";
var module = {};

var kFilterTypes = ['LOWPASS', 'HIGHPASS', 'BANDPASS', 'LOWSHELF', 'HIGHSHELF',
                    'PEAKING', 'NOTCH', 'ALLPASS'];
var kFilterHasGain = [false, false, false, true, true, true, false, false];
var kFreqFactorMin = 0.5;
var kFreqFactorMax = 3;
var kFreqFactorSteps = 10;
var kLFOFreqBase = 10;
var kLFOFreqMinExp = -1;  // 10^-1 = 0.1
var kLFOFreqMaxExp = 1;  // 10^1 = 10
var kLFOFreqSteps = 20;
var kLFOGainBase = 10;
var kLFOGainMinExp = -2;  // 10^-2 = 0.01
var kLFOGainMaxExp = 0;  // 10^0 = 1
var kLFOGainSteps = 10;
var kLFOPhaseMin = -180;
var kLFOPhaseMax = 180;
var kLFOPhaseSteps = 36;
var kQMin = 1;
var kQMax = 20;
var kQSteps = 19;
var kGainMin = -20;
var kGainMax = 20;
var kGainSteps = 40;

module.UI = function(instrument, element) {
  this.instrument_ = instrument;

  var s = SettingsUI.makeSubRow;
  var ss = SettingsUI.makeSubSubRow;
  this.group_ = new SettingsUI.Group(element, 'Filter');
  this.enabledRow_ = this.group_.addCheckRow('Enabled');
  this.typeRow_ = s(this.group_.addSelectRow('Type', kFilterTypes));
  this.frequencyRow_ = s(this.group_.addLinearRangeRow(
      'Frequency', kFreqFactorMin, kFreqFactorMax, kFreqFactorSteps));
  this.lfoEnabledRow_ = ss(this.group_.addCheckRow('Oscillate'));
  this.lfoFrequencyRow_ = ss(this.group_.addExponentialRangeRow(
      'Speed', kLFOFreqBase, kLFOFreqMinExp, kLFOFreqMaxExp, kLFOFreqSteps));
  this.lfoGainRow_ = ss(this.group_.addExponentialRangeRow(
      'Amplitude', kLFOGainBase, kLFOGainMinExp, kLFOGainMaxExp, kLFOGainSteps));
  this.lfoPhaseRow_ = ss(this.group_.addLinearRangeRow(
      'Phase', kLFOPhaseMin, kLFOPhaseMax, kLFOPhaseSteps));
  this.qRow_ = s(this.group_.addLinearRangeRow(
      'Q', kQMin, kQMax, kQSteps))
  this.gainRow_ = s(this.group_.addLinearRangeRow(
      'Gain', kGainMin, kGainMax, kGainSteps));

  var ui = this;
  var changeHandler = function() {
    ui.instrument_.filter.enabled = ui.enabledRow_.value();
    ui.instrument_.filter.type = ui.typeRow_.value();
    ui.instrument_.filter.frequencyFactor = ui.frequencyRow_.value();
    ui.instrument_.filter.lfo.enabled = ui.lfoEnabledRow_.value();
    ui.instrument_.filter.lfo.frequency = ui.lfoFrequencyRow_.value();
    ui.instrument_.filter.lfo.phase = 2 * Math.PI * ui.lfoPhaseRow_.value() / 360;
    ui.instrument_.filter.lfo.gain = ui.lfoGainRow_.value();
    ui.instrument_.filter.q = ui.qRow_.value();
    ui.instrument_.filter.gain = ui.gainRow_.value();
    ui.updateDisplay_();
  }
  this.enabledRow_.onchange = changeHandler;
  this.typeRow_.onchange = changeHandler;
  this.frequencyRow_.onchange = changeHandler;
  this.lfoEnabledRow_.onchange = changeHandler;
  this.lfoFrequencyRow_.onchange = changeHandler;
  this.lfoGainRow_.onchange = changeHandler;
  this.lfoPhaseRow_.onchange = changeHandler;
  this.qRow_.onchange = changeHandler;
  this.gainRow_.onchange = changeHandler;

  this.setInitialValues_();
  this.response_ = [];
  changeHandler();
}

module.UI.prototype.setInitialValues_ = function() {
  this.enabledRow_.setValue(true);
  this.typeRow_.setValue(0);
  this.frequencyRow_.setValue(1.2);
  this.lfoEnabledRow_.setValue(true);
  this.lfoFrequencyRow_.setValue(3);
  this.lfoGainRow_.setValue(0.1);
  this.lfoPhaseRow_.setValue(90);
  this.qRow_.setValue(6);
  this.gainRow_.setValue(10);
}

module.UI.prototype.updateDisplay_ = function() {
  var r = SettingsUI.roundForDisplay;
  this.frequencyRow_.setLabel('x ' + r(this.frequencyRow_.value()));
  this.lfoFrequencyRow_.setLabel(r(this.lfoFrequencyRow_.value()) + ' Hz');
  this.lfoGainRow_.setLabel('+- ' + r(this.lfoGainRow_.value()));
  this.lfoPhaseRow_.setLabel(this.lfoPhaseRow_.value());
  this.qRow_.setLabel(this.qRow_.value());
  this.gainRow_.setLabel(this.gainRow_.value() + ' dB');
  this.enableDisable_();
  this.drawResponse_();
}

module.UI.prototype.enableDisable_ = function() {
  var enabled = this.enabledRow_.value();
  var lfoEnabled = enabled && this.lfoEnabledRow_.value();
  var gainEnabled = enabled && kFilterHasGain[this.typeRow_.value()];
  this.typeRow_.enableDisable(enabled);
  this.frequencyRow_.enableDisable(enabled);
  this.qRow_.enableDisable(enabled);
  this.gainRow_.enableDisable(gainEnabled);
  this.lfoEnabledRow_.enableDisable(enabled);
  this.lfoFrequencyRow_.enableDisable(lfoEnabled);
  this.lfoGainRow_.enableDisable(lfoEnabled);
  this.lfoPhaseRow_.enableDisable(lfoEnabled);
}

var kBounds = SettingsUI.kDisplayBounds;
var kMid = SettingsUI.kDisplayMid;
var kXPadding = 12.5;
var kXRange = kBounds.x - (2 * kXPadding);
var kMaxMagPadding = 1;
var kMinMag = -20;
var kFreqStart = 10;
var kFreqEnd = 15000;
var kAxisColor = "#999";
var kAxisWidth = 1;
var kResponseColor = "green";
var kResponseWidth = 2;
var kResponseMin = "#80F080";
var kResponseMax = "#F0F0F0";
var kResponseMinVar = 0.05;
var kResponseFlat = "#E0E0E0";
var kMinFreqPcnt = 25;  // Min is greater than max, as low frequency maps to
var kMaxFreqPcnt = 2;   // a large period.
var kPhaseWidth = 1;
var kPhaseColor = "magenta";

module.UI.prototype.drawBackground_ = function(noteIndex, xAxisY) {
  this.response_.push(SVGUtils.createLine(0, xAxisY,
                                          kBounds.x, xAxisY,
                                          kAxisColor, kAxisWidth,
                                          this.group_.svgDoc, this.group_.svg));
  this.response_.push(SVGUtils.createLine(kXPadding, 0,
                                          kXPadding, kBounds.y,
                                          kAxisColor, kAxisWidth,
                                          this.group_.svgDoc, this.group_.svg));
  this.response_.push(SVGUtils.createLine(kXPadding + noteIndex, 0,
                                          kXPadding + noteIndex, kBounds.y,
                                          kAxisColor, kAxisWidth,
                                          this.group_.svgDoc, this.group_.svg));
}

function linearValue(value, valueMin, valueMax, linearMin, linearMax) {
  var exponent = Math.log(value) / Math.log(10);
  var factor = (linearMax - linearMin) / (valueMax - valueMin);
  return (exponent - valueMin) * factor + linearMin;
}

function pcntToStr(val) {
  return val.toString() + '%';
}

module.UI.prototype.findGradient_ = function() {
  if (this.gradient_)
    this.group_.svg.defs.removeChild(this.gradient_);
  if (this.instrument_.filter.lfo.enabled) {
    var gainPos = linearValue(this.instrument_.filter.lfo.gain, kLFOGainMinExp, kLFOGainMaxExp, kResponseMinVar, 0.5);
    var begin = SVGUtils.interpolateColors(kResponseMin, kResponseMax, 0.5 - gainPos);
    var end = SVGUtils.interpolateColors(kResponseMin, kResponseMax, 0.5 + gainPos);
    var frequencyPcnt = linearValue(this.instrument_.filter.lfo.frequency, kLFOFreqMinExp, kLFOFreqMaxExp, kMinFreqPcnt, kMaxFreqPcnt);
    var phasePcnt = (this.instrument_.filter.lfo.phase) * frequencyPcnt / Math.PI;
    this.gradient_ = SVGUtils.createLinearGradient(
        "filterGradient", pcntToStr(phasePcnt), "0%",
        pcntToStr(phasePcnt + frequencyPcnt), "0", "reflect",
        this.group_.svgDoc, this.group_.svg);
    SVGUtils.addStopToGradient("0", begin, this.gradient_, this.group_.svgDoc);
    SVGUtils.addStopToGradient("1", end, this.gradient_, this.group_.svgDoc);
    return "url(#filterGradient)";
  } else {
    delete this.gradient_;
    return kResponseFlat;
  }
}

function gainToDB(gain) {
  // 10dB = gain of 2 (is that right? or is it 20?)
  // so db = logbase2(gain) * 10
  return 10 * Math.log(gain) / Math.log(2);
}

module.UI.prototype.drawResponse_ = function() {
  var ui = this;
  this.response_.forEach(function(child) {
    ui.group_.svg.removeChild(child);
  });
  this.response_ = [];
  if (!this.instrument_.filter.enabled)
    return;

  var magPoints = [];
  var phasePoints = [];
  var response = this.instrument_.filter.getFrequencyResponse(kFreqStart, kFreqEnd, kXRange);
  var maxMag = gainToDB(response.maxMag) + kMaxMagPadding;
  var magRange = maxMag - kMinMag;
  for (var i = 0; i < response.mag.length; i++) {
    var x = kXPadding + i;
    var magY = kBounds.y * (maxMag - gainToDB(response.mag[i])) / magRange;
    SVGUtils.addPointToArray(x, magY, magPoints);
    var phaseY = kBounds.y * (Math.PI - response.phase[i]) / (2 * Math.PI);
    SVGUtils.addPointToArray(x, phaseY, phasePoints);
  }
  var xAxisY = kBounds.y * maxMag / magRange;
  SVGUtils.addPointToArray(kBounds.x - kXPadding, kBounds.y, magPoints);
  SVGUtils.addPointToArray(kXPadding, kBounds.y, magPoints);
  this.response_.push(SVGUtils.createPolyLine(magPoints,
                                              "none", 0, this.findGradient_(),
                                              this.group_.svgDoc, this.group_.svg));
  this.drawBackground_(response.noteIndex, xAxisY);
  this.response_.push(SVGUtils.createLine(kXPadding + response.filterIndex, 0,
                                          kXPadding + response.filterIndex, kBounds.y,
                                          kResponseColor, kAxisWidth,
                                          this.group_.svgDoc, this.group_.svg));
  magPoints.pop();
  magPoints.pop();
  this.response_.push(SVGUtils.createPolyLine(magPoints,
                                              kResponseColor, kResponseWidth, "none",
                                              this.group_.svgDoc, this.group_.svg));
  this.response_.push(SVGUtils.createPolyLine(phasePoints,
                                              kPhaseColor, kPhaseWidth, "none",
                                              this.group_.svgDoc, this.group_.svg));
}

return module;

})();
