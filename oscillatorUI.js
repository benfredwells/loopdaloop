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
var kWaveStrokeWidth = 2;
var kWaveXPadding = 12.5;
var kWaveYPadding = 10;
// The code assumes the periods is not integral but has an extra half period.
var kWavePeriods = 7.5;
var kWavePeriod = Math.round((kBounds.x - 2 * kWaveXPadding) / kWavePeriods);
var kWaveWidth = kWavePeriod * kWavePeriods;
var kWaveYLow = kWaveYPadding + kWaveStrokeWidth / 2;
var kWaveYHigh = kBounds.y - kWaveYPadding - kWaveStrokeWidth / 2;
var kWaveXStart = kWaveXPadding;
var kWaveColorMin = "#4040A0";
var kWaveColorMax = "#E0E0F0";
var kWaveCenter = 0.5;
var kWaveColorFlat = "#008000";
var kBackgroundColorMin = "#F0F0F0";
var kBackgroundColorMax = "#C0C0C0";
var kBackgroundCenter = 0.1;
var kBackgroundColorFlat = "#EEEEEE";
var kBackgroundXPadding = 4;
var kBackgroundYPadding = 5;

module.UI.prototype.drawSineWave_ = function(gradient) {
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
                                       gradient, kWaveStrokeWidth,
                                       this.group_.svgDoc, this.group_.svg);
}

module.UI.prototype.drawSquareWave_ = function(gradient) {
  var x = kWaveXStart;
  var points = [];
  SVGUtils.addPointToArray(x, kWaveYHigh, points);
  x = x + kWavePeriod / 4;
  if (kWaveStrokeWidth%2)
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
  if (kWaveStrokeWidth%2)
    x = x - 0.5;
  SVGUtils.addPointToArray(x, kWaveYLow, points);
  this.waveform_ = SVGUtils.createPolyLine(points,
                                           gradient, kWaveStrokeWidth, "none",
                                           this.group_.svgDoc, this.group_.svg);
}

module.UI.prototype.drawTriangleWave_ = function(gradient) {
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
                                           gradient, kWaveStrokeWidth, "none",
                                           this.group_.svgDoc, this.group_.svg);
}

module.UI.prototype.drawSawtoothWave_ = function(gradient) {
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
                                           gradient, kWaveStrokeWidth, "none",
                                           this.group_.svgDoc, this.group_.svg);
}

module.UI.prototype.drawWave_ = function() {
  if (this.background_)
    this.group_.svg.removeChild(this.background_)
  var tremoloGradient = this.group_.defineLFOGradientOrSolid(
      'tremoloGradient',
      this.instrument_.oscillator.tremolo,
      this.tremoloController_,
      kBackgroundColorMin,
      kBackgroundColorMax,
      kBackgroundCenter,
      kBackgroundColorFlat);
  this.background_ = SVGUtils.createRect(kWaveXStart - kBackgroundXPadding,
                                         kWaveYLow - kBackgroundYPadding,
                                         kWaveWidth + kBackgroundXPadding * 2,
                                         kWaveYHigh - kWaveYLow + kBackgroundYPadding * 2,
                                         kBackgroundColorFlat, 0, tremoloGradient,
                                         this.group_.svgDoc, this.group_.svg);

  if (this.axis_)
    this.group_.svg.removeChild(this.axis_);

  this.axis_ = SVGUtils.createLine(0, kMid.y,
                                   kBounds.x, kMid.y,
                                   kAxisColor, 1,
                                   this.group_.svgDoc, this.group_.svg);

  if (this.waveform_)
    this.group_.svg.removeChild(this.waveform_);
  var vibratoGradient = this.group_.defineLFOGradientOrSolid(
      'vibratoGradient',
      this.instrument_.oscillator.vibrato,
      this.vibratoController_,
      kWaveColorMin,
      kWaveColorMax,
      kWaveCenter,
      kWaveColorFlat);
  switch (this.typeRow_.value()) {
    case "sine": this.drawSineWave_(vibratoGradient); break;
    case "square": this.drawSquareWave_(vibratoGradient); break;
    case "sawtooth": this.drawSawtoothWave_(vibratoGradient); break;
    case "triangle": this.drawTriangleWave_(vibratoGradient); break;
  }
}

return module;

})();
