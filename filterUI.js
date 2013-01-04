FilterUI = (function() {

"use strict";
var module = {};

var kFilterCaptions = ['Low pass', 'High pass', 'Band pass', 'Low shelf',
                       'High shelf', 'Peaking', 'Notch', 'All pass'];
var kFilterValues = ['lowpass', 'highpass', 'bandpass', 'lowshelf', 'highshelf',
                    'peaking', 'notch', 'allpass'];
var kFilterHasGain = [false, false, false, true, true, true, false, false];

var kEnabledRowDef = {title: 'Enabled'};
var kTypeRowDef = {title: 'Type', captions: kFilterCaptions, values: kFilterValues};
var kFreqFactorRowDef = {title: 'Frequency', min: 0.1, max: 10, steps: 10};
var kLFOControllerDef = {title: 'Oscillate', indent: 1};
var kQRowDef = {title: 'Q', min: 1, max: 20, steps: 19};
var kGainRowDef = {title: 'Gain', min: -20, max: 20, steps: 40};

module.UI = function(instrument, parent) {
  this.instrument_ = instrument;

  this.group_ = new SettingsUI.Group(parent, 'Filter', this);
  var s = SettingsUI.makeSubRow;
  var ss = SettingsUI.makeSubSubRow;
  var g = this.group_;

  this.enabledRow_ = g.addCheckRow(kEnabledRowDef);
  this.typeRow_ = s(g.addSelectRow(kTypeRowDef));
  this.frequencyRow_ = s(g.addLinearRangeRow(kFreqFactorRowDef));
  this.lfoController_ = g.addLFOController(kLFOControllerDef, instrument.filter.lfo);
  this.qRow_ = s(g.addLinearRangeRow(kQRowDef));
  this.gainRow_ = s(g.addLinearRangeRow(kGainRowDef));

  var ui = this;
  var changeHandler = function() {
    ui.instrument_.filter.enabled = ui.enabledRow_.value();
    ui.instrument_.filter.type = ui.typeRow_.value();
    ui.instrument_.filter.frequencyFactor = ui.frequencyRow_.value();
    ui.instrument_.filter.q = ui.qRow_.value();
    ui.instrument_.filter.gain = ui.gainRow_.value();
    ui.updateDisplay_();
  }

  this.setInitialValues_();
  this.response_ = [];
  this.lfoController_.changeHandler();
  changeHandler();

  this.enabledRow_.onchange = changeHandler;
  this.lfoController_.onchange = changeHandler;
  this.typeRow_.onchange = changeHandler;
  this.frequencyRow_.onchange = changeHandler;
  this.qRow_.onchange = changeHandler;
  this.gainRow_.onchange = changeHandler;
}

module.UI.prototype.setInitialValues_ = function() {
  this.enabledRow_.setValue(true);
  this.typeRow_.setValue('lowpass');
  this.frequencyRow_.setValue(1.2);
  this.lfoController_.enabledRow.setValue(true);
  this.lfoController_.frequencyRow.setValue(3);
  this.lfoController_.gainRow.setValue(0.1);
  this.lfoController_.phaseRow.setValue(90);
  this.qRow_.setValue(6);
  this.gainRow_.setValue(10);
}

module.UI.prototype.updateDisplay_ = function() {
  var r = SettingsUI.roundForDisplay;
  this.frequencyRow_.setLabel('x ' + r(this.frequencyRow_.value()));
  this.lfoController_.updateDisplay();
  this.qRow_.setLabel(this.qRow_.value());
  this.gainRow_.setLabel(this.gainRow_.value() + ' dB');
  this.enableDisable_();
  this.drawResponse_();
}

module.UI.prototype.enableDisable_ = function() {
  var enabled = this.enabledRow_.value();
  var gainEnabled = enabled && kFilterHasGain[this.typeRow_.value()];
  this.typeRow_.enableDisable(enabled);
  this.frequencyRow_.enableDisable(enabled);
  this.lfoController_.enableDisable(enabled);
  this.qRow_.enableDisable(enabled);
  this.gainRow_.enableDisable(gainEnabled);
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
var kResponseMin = "#408040";
var kResponseMax = "#F0F0F0";
var kResponseMinVar = 0.05;
var kResponseFlat = "#90B090";
var kMinFreqPcnt = 25;  // Min is greater than max, as low frequency maps to
var kMaxFreqPcnt = 2;   // a large period.
var kPhaseWidth = 1;
var kPhaseColor = "magenta";

module.UI.prototype.drawBackground_ = function(noteIndex, xAxisY) {
  this.response_.push(SVGUtils.createLine(0, xAxisY + 0.5,
                                          kBounds.x, xAxisY + 0.5,
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

function linearValue(value, exponentialRowDef, linearMin, linearMax) {
  var exponent = Math.log(value) / Math.log(exponentialRowDef.base);
  var expMin = exponentialRowDef.minExponent;
  var expMax = exponentialRowDef.maxExponent;
  var factor = (linearMax - linearMin) / (expMax - expMin);
  return (exponent - expMin) * factor + linearMin;
}

function pcntToStr(val) {
  return val.toString() + '%';
}

module.UI.prototype.findGradient_ = function() {
  if (this.gradient_)
    this.group_.svg.defs.removeChild(this.gradient_);
  if (this.instrument_.filter.lfo.enabled) {
    var gainPos = linearValue(this.instrument_.filter.lfo.gain, this.lfoController_.gainRowDef, kResponseMinVar, 0.5);
    var begin = SVGUtils.interpolateColors(kResponseMin, kResponseMax, 0.5 - gainPos);
    var end = SVGUtils.interpolateColors(kResponseMin, kResponseMax, 0.5 + gainPos);
    var frequencyPcnt = linearValue(this.instrument_.filter.lfo.frequency, this.lfoController_.freqRowDef, kMinFreqPcnt, kMaxFreqPcnt);
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
