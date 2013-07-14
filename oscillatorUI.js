OscillatorUI = (function() {

"use strict";
var module = {};

var kTypeDescriptions = {};
kTypeDescriptions[Instrument.kSineWave] = Strings.kSine;
kTypeDescriptions[Instrument.kSquareWave] = Strings.kSquare;
kTypeDescriptions[Instrument.kSawtoothWave] = Strings.kSawtooth;
kTypeDescriptions[Instrument.kTriangleWave] = Strings.kTriangle;

var kOctaveOffsetRowDef = {title: 'Octave offset',
                           min: -4,
                           max: 4,
                           steps: 8}
var kNoteOffsetRowDef = {title: 'Semitone offset',
                        min: -8,
                        max: 8,
                        steps: 16};
var kDetuneRowDef = {title: 'Detune',
                     min: -50,
                     max: 50,
                     steps: 100};

module.UI = function(id, oscillator, title, categoriesEl, detailsEl, collapsed) {
  this.id = id;
  this.oscillator_ = oscillator;
  this.title = title;

  this.group_ = new SettingsUI.Group(categoriesEl, detailsEl, title , this, collapsed);
  this.typeRow_ = this.group_.addSelectRow(Strings.kType, oscillator.type, kTypeDescriptions);
  this.octaveOffsetRow_ = this.group_.addLinearRangeRow(kOctaveOffsetRowDef);
  this.noteOffsetRow_ = this.group_.addLinearRangeRow(kNoteOffsetRowDef);
  this.detuneRow_ = this.group_.addLinearRangeRow(kDetuneRowDef);

  var s = SettingsUI.makeSubRow;
  var g = this.group_;

  var ui = this;
  var changeHandler = function() {
    ui.oscillator_.octaveOffset = ui.octaveOffsetRow_.value();
    ui.oscillator_.noteOffset = ui.noteOffsetRow_.value();
    ui.oscillator_.detune = ui.detuneRow_.value();
    ui.updateDisplay_();
  }
  this.typeRow_.onchange = changeHandler;
  this.octaveOffsetRow_.onchange = changeHandler;
  this.noteOffsetRow_.onchange = changeHandler;
  this.detuneRow_.onchange = changeHandler;
  this.setInitialValues_();
  changeHandler();
}

module.UI.prototype.setInitialValues_ = function() {
  this.octaveOffsetRow_.setValue(0);
  this.noteOffsetRow_.setValue(0);
  this.detuneRow_.setValue(0);
}

module.UI.prototype.updateDisplay_ = function() {
  this.octaveOffsetRow_.setLabel(this.octaveOffsetRow_.value());
  this.noteOffsetRow_.setLabel(this.noteOffsetRow_.value());
  this.detuneRow_.setLabel(this.detuneRow_.value());
  this.enableDisable_();
  this.drawWave_();
}

module.UI.prototype.enableDisable_ = function() {
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
                                       kWaveColorFlat, kWaveStrokeWidth,
                                       this.group_.svgDoc, this.group_.svg);
}

module.UI.prototype.drawSquareWave_ = function() {
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
                                           kWaveColorFlat, kWaveStrokeWidth, "none",
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
                                           kWaveColorFlat, kWaveStrokeWidth, "none",
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
                                           kWaveColorFlat, kWaveStrokeWidth, "none",
                                           this.group_.svgDoc, this.group_.svg);
}

module.UI.prototype.drawWave_ = function() {
  if (this.background_)
    this.group_.svg.removeChild(this.background_)
  this.background_ = SVGUtils.createRect(kWaveXStart - kBackgroundXPadding,
                                         kWaveYLow - kBackgroundYPadding,
                                         kWaveWidth + kBackgroundXPadding * 2,
                                         kWaveYHigh - kWaveYLow + kBackgroundYPadding * 2,
                                         kBackgroundColorFlat, 0, kBackgroundColorFlat,
                                         this.group_.svgDoc, this.group_.svg);

  if (this.axis_)
    this.group_.svg.removeChild(this.axis_);

  this.axis_ = SVGUtils.createLine(0, kMid.y,
                                   kBounds.x, kMid.y,
                                   kAxisColor, 1,
                                   this.group_.svgDoc, this.group_.svg);

  if (this.waveform_)
    this.group_.svg.removeChild(this.waveform_);
  switch (this.oscillator_.type.value) {
    case Instrument.kSineWave: this.drawSineWave_(); break;
    case Instrument.kSquareWave: this.drawSquareWave_(); break;
    case Instrument.kSawtoothWave: this.drawSawtoothWave_(); break;
    case Instrument.kTriangleWave: this.drawTriangleWave_(); break;
  }
}

return module;

})();
