OscillatorUI = (function() {

"use strict";
var module = {};

var kTypeRowDef = {title: 'Type',
                   captions: ['Sine', 'Square', 'Sawtooth', 'Triangle'],
                   values: ['sine', 'square', 'sawtooth', 'triangle']};

var kVibratoRowDef = {title: 'Vibrato', indent: 0};
var kTremoloRowDef = {title: 'Tremolo', indent: 0};

module.UI = function(instrument, parent) {
  this.instrument_ = instrument;

  this.group_ = new SettingsUI.Group(parent, 'Oscillator', this);
  this.typeRow_ = this.group_.addSelectRow(kTypeRowDef);

  var s = SettingsUI.makeSubRow;
  var g = this.group_;

  this.vibratoController_ = g.addLFOController(kVibratoRowDef, instrument.oscillator.vibrato);
  this.tremoloController_ = g.addLFOController(kTremoloRowDef, instrument.oscillator.tremolo);

  var ui = this;
  var changeHandler = function() {
    ui.instrument_.oscillator.type = ui.typeRow_.value();
    ui.updateDisplay_();
  }
  this.typeRow_.onchange = changeHandler;
  this.vibratoController_.onchange = changeHandler;
  this.tremoloController_.onchange = changeHandler;
  this.typeRow_.setValue('sawtooth');
  changeHandler();
}

module.UI.prototype.updateDisplay_ = function() {
  this.vibratoController_.updateDisplay();
  this.tremoloController_.updateDisplay();
  this.enableDisable_();
  this.drawWave_();
}

module.UI.prototype.enableDisable_ = function() {
  this.vibratoController_.enableDisable(true);
  this.tremoloController_.enableDisable(true);
}

var kBounds = SettingsUI.kDisplayBounds;
var kMid = SettingsUI.kDisplayMid;
var kAxisColor = "#999";
var kWaveColor = "#080";
var kWaveWidth = 2;
var kWaveXPadding = 12.5;
var kWaveYPadding = 10;
// The code assumes the periods is not integral but has an extra half period.
var kWavePeriods = 7.5;
var kWavePeriod = Math.round((kBounds.x - 2 * kWaveXPadding) / kWavePeriods);
var kWaveYLow = kWaveYPadding + kWaveWidth / 2;
var kWaveYHigh = kBounds.y - kWaveYPadding - kWaveWidth / 2;
var kWaveXStart = kWaveXPadding;
var kResponseMin = "#408040";
var kResponseMax = "#F0F0F0";
var kResponseMinVar = 0.05;
var kResponseFlat = "#90B090";
var kMinFreqPcnt = 25;  // Min is greater than max, as low frequency maps to
var kMaxFreqPcnt = 2;   // a large period.

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
  if (this.instrument_.oscillator.vibrato.enabled) {
    var gainPos = linearValue(this.instrument_.oscillator.vibrato.gain, this.vibratoController_.gainRowDef, kResponseMinVar, 0.5);
    var begin = SVGUtils.interpolateColors(kResponseMin, kResponseMax, 0.5 - gainPos);
    var end = SVGUtils.interpolateColors(kResponseMin, kResponseMax, 0.5 + gainPos);
    var frequencyPcnt = linearValue(this.instrument_.oscillator.vibrato.frequency, this.vibratoController_.freqRowDef, kMinFreqPcnt, kMaxFreqPcnt);
    var phasePcnt = (this.instrument_.oscillator.vibrato.phase) * frequencyPcnt / Math.PI;
    this.gradient_ = SVGUtils.createLinearGradient(
        "vibratoGradient", pcntToStr(phasePcnt), "0%",
        pcntToStr(phasePcnt + frequencyPcnt), "0", "reflect",
        this.group_.svgDoc, this.group_.svg);
    SVGUtils.addStopToGradient("0", begin, this.gradient_, this.group_.svgDoc);
    SVGUtils.addStopToGradient("1", end, this.gradient_, this.group_.svgDoc);
    return "url(#vibratoGradient)";
  } else {
    delete this.gradient_;
    return kResponseFlat;
  }
}

module.UI.prototype.drawSineWave_ = function() {
  var x = kWaveXStart;
  var kCubicFactor = kWavePeriod * 0.25;
  var path = SVGUtils.startPath(x, kWaveYHigh);
  for (var i = 0; i < Math.floor(kWavePeriods); i++) {
    path = SVGUtils.addCubicToPath(false, path,
                                   x + kCubicFactor, kWaveYHigh,
                                   x + kWavePeriod / 2 - kCubicFactor, kWaveYLow,
                                   x + kWavePeriod / 2, kWaveYLow);
    x = x + kWavePeriod / 2;
    path = SVGUtils.addCubicToPath(false, path,
                                   x + kCubicFactor, kWaveYLow,
                                   x + kWavePeriod / 2 - kCubicFactor, kWaveYHigh,
                                   x + kWavePeriod / 2, kWaveYHigh);
    x = x + kWavePeriod / 2;
  }
  path = SVGUtils.addCubicToPath(false, path,
                                 x + kCubicFactor, kWaveYHigh,
                                 x + kWavePeriod / 2 - kCubicFactor, kWaveYLow,
                                 x + kWavePeriod / 2, kWaveYLow);
  this.waveform_ = SVGUtils.createPath(path,
                                       this.findGradient_(), kWaveWidth,
                                       this.group_.svgDoc, this.group_.svg);
}

module.UI.prototype.drawSquareWave_ = function() {
  var x = kWaveXStart;
  var points = [];
  SVGUtils.addPointToArray(x, kWaveYHigh, points);
  x = x + kWavePeriod / 4;
  if (kWaveWidth%2)
    x = x + 0.5;
  for (var i = 0; i < Math.floor(kWavePeriods); i++) {
    SVGUtils.addPointToArray(x, kWaveYHigh, points);
    SVGUtils.addPointToArray(x, kWaveYLow, points);
    x = x + kWavePeriod / 2;
    SVGUtils.addPointToArray(x, kWaveYLow, points);
    SVGUtils.addPointToArray(x, kWaveYHigh, points);
    x = x + kWavePeriod / 2;
  }
  SVGUtils.addPointToArray(x, kWaveYHigh, points);
  SVGUtils.addPointToArray(x, kWaveYLow, points);
  x = x + kWavePeriod / 4;
  if (kWaveWidth%2)
    x = x - 0.5;
  SVGUtils.addPointToArray(x, kWaveYLow, points);
  this.waveform_ = SVGUtils.createPolyLine(points,
                                           this.findGradient_(), kWaveWidth, "none",
                                           this.group_.svgDoc, this.group_.svg);
}

module.UI.prototype.drawTriangleWave_ = function() {
  var x = kWaveXStart;
  var points = [];
  SVGUtils.addPointToArray(x, kWaveYHigh, points);
  x = x + kWavePeriod / 2;
  for (var i = 0; i < Math.floor(kWavePeriods); i++) {
    SVGUtils.addPointToArray(x, kWaveYLow, points);
    x = x + kWavePeriod / 2;
    SVGUtils.addPointToArray(x, kWaveYHigh, points);
    x = x + kWavePeriod / 2;
  }
  SVGUtils.addPointToArray(x, kWaveYLow, points);
  this.waveform_ = SVGUtils.createPolyLine(points,
                                           this.findGradient_(), kWaveWidth, "none",
                                           this.group_.svgDoc, this.group_.svg);
}

module.UI.prototype.drawSawtoothWave_ = function() {
  var x = kWaveXStart;
  var points = [];
  var kLeadingPeriod = 0.25;
  var yStart = kWaveYLow + kLeadingPeriod * (kWaveYHigh - kWaveYLow);
  SVGUtils.addPointToArray(x, yStart, points);
  x = x + kWavePeriod * kLeadingPeriod;
  for (var i = 0; i < Math.ceil(kWavePeriods); i++) {
    SVGUtils.addPointToArray(x, kWaveYLow, points);
    SVGUtils.addPointToArray(x, kWaveYHigh, points);
    x = x + kWavePeriod;
  }
  x = x - kWavePeriod * (1 - kLeadingPeriod);
  var yFinish = kWaveYLow + (1 - kLeadingPeriod) * (kWaveYHigh - kWaveYLow);
  SVGUtils.addPointToArray(x, yFinish, points);
  this.waveform_ = SVGUtils.createPolyLine(points,
                                           this.findGradient_(), kWaveWidth, "none",
                                           this.group_.svgDoc, this.group_.svg);
}

module.UI.prototype.drawWave_ = function() {
  if (!this.background_) {
    SVGUtils.createLine(0, kMid.y,
                        kBounds.x, kMid.y,
                        kAxisColor, 1,
                        this.group_.svgDoc, this.group_.svg);
    this.background_ = true;
  }

  if (this.waveform_)
    this.group_.svg.removeChild(this.waveform_)
  switch (this.typeRow_.value()) {
    case "sine": this.drawSineWave_(); break;
    case "square": this.drawSquareWave_(); break;
    case "sawtooth": this.drawSawtoothWave_(); break;
    case "triangle": this.drawTriangleWave_(); break;
  }
}

return module;

})();
