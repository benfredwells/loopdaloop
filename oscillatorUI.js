OscillatorUI = (function() {

"use strict";
var module = {};

var kWaveTypes = ['SINE', 'SQUARE', 'SAWTOOTH', 'TRIANGLE'];

module.UI = function(instrument, element) {
  this.instrument_ = instrument;

  this.group_ = new SettingsUIGroup.Group(element, 'Oscillator');
  this.typeRow_ = this.group_.addSelectRow('Type', kWaveTypes);

  var ui = this;
  this.typeChanged = function() {
    ui.instrument_.oscillatorType = ui.type_();
    ui.updateDisplay_();
  }
  this.typeRow_.select.onchange = this.typeChanged;

  this.updateDisplay_();
}

var kBounds = SettingsUIGroup.kDisplayBounds;
var kMid = SettingsUIGroup.kDisplayMid;
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
                                       kWaveColor, kWaveWidth,
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
                                           kWaveColor, kWaveWidth,
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
                                           kWaveColor, kWaveWidth,
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
                                           kWaveColor, kWaveWidth,
                                           this.group_.svgDoc, this.group_.svg);
}

module.UI.prototype.updateDisplay_ = function() {
  if (!this.background_) {
    SVGUtils.createLine(0, kMid.y,
                        kBounds.x, kMid.y,
                        kAxisColor, 1,
                        this.group_.svgDoc, this.group_.svg);
    this.background_ = true;
  }

  if (this.waveform_)
    this.group_.svg.removeChild(this.waveform_)
  switch (this.type_()) {
    case "0": this.drawSineWave_(); break;
    case "1": this.drawSquareWave_(); break;
    case "2": this.drawSawtoothWave_(); break;
    case "3": this.drawTriangleWave_(); break;
  }
}

module.UI.prototype.type_ = function() {
  return this.typeRow_.select.value;
}

return module;

})();
