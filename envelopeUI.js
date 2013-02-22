EnvelopeUI = (function() {

"use strict";
var module = {};

var kAttackDelayRowDef = {title: 'Attack Delay', base: 10, minExponent: -2, maxExponent:1, steps: 10};
var kAttackRowDef = {title: 'Attack', base: 10, minExponent: -2, maxExponent:1, steps: 10};
var kAttackHoldRowDef = {title: 'Attack Hold', base: 10, minExponent: -2, maxExponent:1, steps: 10};
var kDecayRowDef = {title: 'Decay', base: 10, minExponent: -2, maxExponent:1, steps: 10};
var kSustainRowDef = {title: 'Sustain', min: 0, max: 1, steps: 20};
var kSustainHoldRowDef = {title: 'Sustain Hold', base: 10, minExponent: -2, maxExponent:1, steps: 10};
var kReleaseRowDef = {title: 'Release', base: 10, minExponent: -2, maxExponent:1, steps: 10};

module.UI = function(instrument, parent) {
  this.instrument_ = instrument;

  this.group_ = new SettingsUI.Group(parent, 'Envelope', this);
  this.attackDelayRow_ = this.group_.addExponentialRangeRow(kAttackDelayRowDef);
  this.attackRow_ = this.group_.addExponentialRangeRow(kAttackRowDef);
  this.attackHoldRow_ = this.group_.addExponentialRangeRow(kAttackHoldRowDef);
  this.decayRow_ = this.group_.addExponentialRangeRow(kDecayRowDef);
  this.sustainRow_ = this.group_.addLinearRangeRow(kSustainRowDef);
  this.sustainHoldRow_ = this.group_.addExponentialRangeRow(kSustainHoldRowDef);
  this.releaseRow_ = this.group_.addExponentialRangeRow(kReleaseRowDef);

  var ui = this;
  var changeHandler = function() {
    ui.instrument_.envelope.attackDelay = ui.attackDelayRow_.value();
    ui.instrument_.envelope.attack = ui.attackRow_.value();
    ui.instrument_.envelope.attackHold = ui.attackHoldRow_.value();
    ui.instrument_.envelope.decay = ui.decayRow_.value();
    ui.instrument_.envelope.sustain = ui.sustainRow_.value();
    ui.instrument_.envelope.sustainHold = ui.sustainHoldRow_.value();
    ui.instrument_.envelope.release = ui.releaseRow_.value();
    ui.updateDisplay_();
  }
  this.attackDelayRow_.onchange = changeHandler;
  this.attackRow_.onchange = changeHandler;
  this.attackHoldRow_.onchange = changeHandler;
  this.decayRow_.onchange = changeHandler;
  this.sustainRow_.onchange = changeHandler;
  this.sustainHoldRow_.onchange = changeHandler;
  this.releaseRow_.onchange = changeHandler;
  this.attackDelayRow_.setValue('0.01');
  this.attackRow_.setValue('0.01');
  this.attackHoldRow_.setValue('0.01');
  this.decayRow_.setValue('0.01');
  this.sustainRow_.setValue('0.5');
  this.sustainHoldRow_.setValue('0.01');
  this.releaseRow_.setValue('0.01');
  changeHandler();
}

module.UI.prototype.updateDisplay_ = function() {
  var r = SettingsUI.roundForDisplay;
  this.attackDelayRow_.setLabel(r(this.attackDelayRow_.value()) + ' s');
  this.attackRow_.setLabel(r(this.attackRow_.value()) + ' s');
  this.attackHoldRow_.setLabel(r(this.attackHoldRow_.value()) + ' s');
  this.decayRow_.setLabel(r(this.decayRow_.value()) + ' s');
  this.sustainRow_.setLabel(r(this.sustainRow_.value() * 100) + '%');
  this.sustainHoldRow_.setLabel(r(this.sustainHoldRow_.value()) + ' s');
  this.releaseRow_.setLabel(r(this.releaseRow_.value()) + ' s');
//  this.drawWave_();
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
var kWaveColorMin = "#4040FF";
var kWaveColorMax = "#FF4040";
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
  this.background_ = SVGUtils.createRect(kWaveXStart - kBackgroundYPadding,
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
