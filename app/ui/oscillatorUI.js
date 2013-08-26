OscillatorUI = (function() {

"use strict";
var module = {};

module.OscillatorVisualizer_ = function(container, oscillator) {
  CategoryUI.CategoryVisualizer.call(this, container);
  this.oscillator_ = oscillator;
}

module.OscillatorVisualizer_.prototype = Object.create(SVGUI.SVGControl.prototype);

var kXSize = 200;
var kYSize = 50;
var kXPadding = 0;
var kYPadding = 1;
var kYBottom = kYSize - kYPadding;
var kHarmonics = (200 / 9);
var kXFudge = 0.5; // To keep base harmonics aligned on pixels :-/
var kYScale = 0.7;
var kBackgroundStroke = "#CCCCCC";
var kBackgroundStrokeWidth = 2;
var kBackgroundFill = "none";
var kHarmonicBackgroundStroke = "#DDDDDD";
var kHarmonicBackgroundStrokeWidth = 1;
var kHarmonicStroke = "#008000";
var kHarmonicStrokeWidth = 2;

module.OscillatorVisualizer_.prototype.harmonicAmplitude_ = function(harmonic) {
  switch (this.oscillator_.typeSetting.value) {
    case Instrument.kSineWave: {
      if (harmonic == 1) 
        return 1
      else
        return 0;
    }
    case Instrument.kSquareWave: {
      if (harmonic % 2 == 0)
        return 0;
      return 4 / (Math.PI * harmonic);
    }
    case Instrument.kSawtoothWave: {
      return 2 / (Math.PI * harmonic);
    }
    case Instrument.kTriangleWave: {
      if (harmonic % 2 == 0)
        return 0;
      return 8 / Math.pow((Math.PI * harmonic), 2);
    }
  }
}

module.OscillatorVisualizer_.prototype.drawVisualization = function() {
  this.svg.clear();
  this.svg.drawRect(0, 0, kXSize, kYSize, kBackgroundStroke, kBackgroundStrokeWidth, kBackgroundFill);
  var baseHarmonicXGap = (kXSize - 2 * kXPadding) / kHarmonics;
  var currentX = kXPadding + baseHarmonicXGap + kXFudge;
  while (currentX < kXSize - kXPadding) {
    this.svg.drawLine(currentX, kYPadding, currentX, kYSize - kYPadding,
                      kHarmonicBackgroundStroke, kHarmonicBackgroundStrokeWidth);
    currentX += baseHarmonicXGap;
  }
  var freqeuencyAdjust = ChromaticScale.frequencyAdjustmentFactor(
      this.oscillator_.octaveOffsetSetting.value,
      this.oscillator_.noteOffsetSetting.value,
      this.oscillator_.detuneSetting.value);
  var noteHarmonicXGap = baseHarmonicXGap * freqeuencyAdjust;
  currentX = kXPadding + noteHarmonicXGap + kXFudge;
  var harmonic = 1;
  while (currentX < kXSize - kXPadding) {
    var height = this.harmonicAmplitude_(harmonic) * (kYSize - 2 * kYPadding) * kYScale;
    this.svg.drawLine(currentX, kYBottom, currentX, kYBottom - height,
                      kHarmonicStroke, kHarmonicStrokeWidth);
    currentX += noteHarmonicXGap;
    harmonic++;
  }
}

var kTypeDescriptions = {};
kTypeDescriptions[Instrument.kSineWave] = Strings.kSine;
kTypeDescriptions[Instrument.kSquareWave] = Strings.kSquare;
kTypeDescriptions[Instrument.kSawtoothWave] = Strings.kSawtooth;
kTypeDescriptions[Instrument.kTriangleWave] = Strings.kTriangle;

module.UI = function(id, oscillator, title, categoriesEl, detailsEl, selected) {
  CategoryUI.UI.call(this, id, title, categoriesEl, detailsEl, selected);
  this.oscillator_ = oscillator;

  this.visualizer_ = new module.OscillatorVisualizer_(this.titleRow.controlDiv, oscillator);

  var ui = this;
  var changeHandler = function() {
    ui.updateDisplay_();
  }
  new SettingsUI.CheckRow(this.settings, Strings.kEnabled, changeHandler, oscillator.enabledSetting);

  this.enablePanel_ = new SettingsUI.Panel(this.settings);
  new SettingsUI.SelectRow(this.enablePanel_, Strings.kType, changeHandler, oscillator.typeSetting, kTypeDescriptions);
  new SettingsUI.LinearRangeRow(this.enablePanel_, Strings.kOctaveOffset, changeHandler, oscillator.octaveOffsetSetting, null, 8);
  new SettingsUI.LinearRangeRow(this.enablePanel_, Strings.kNoteOffset, changeHandler, oscillator.noteOffsetSetting, null, 16);
  new SettingsUI.LinearRangeRow(this.enablePanel_, Strings.kDetune, changeHandler, oscillator.detuneSetting, String.kPercentFormatter, 100);
  new ContourUI.ContourPanel(this.enablePanel_, Strings.kGain,
                             changeHandler, oscillator.gainContour,
                             null, 10, false);

  this.updateDisplay_();
}

module.UI.prototype = Object.create(CategoryUI.UI.prototype);

module.UI.prototype.updateDisplay_ = function() {
  this.enablePanel_.setEnabled(this.oscillator_.enabledSetting.value);;
  this.updateIcon_();
  this.visualizer_.drawVisualization();
}

module.UI.prototype.updateIcon_ = function() {
  var iconClass;
  if (this.oscillator_.enabledSetting.value) {
    switch (this.oscillator_.typeSetting.value) {
      case Instrument.kSineWave: iconClass = 'sineWaveIcon'; break;
      case Instrument.kSquareWave: iconClass = 'squareWaveIcon'; break;
      case Instrument.kSawtoothWave: iconClass = 'sawtoothWaveIcon'; break;
      case Instrument.kTriangleWave: iconClass = 'triangleWaveIcon'; break;
    }
  } else {
    iconClass = 'disabledWaveIcon';
  }
  this.setIconClass(iconClass);
}

/*

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

  if (this.axis_) {
    this.group_.svg.removeChild(this.axis_);
    this.axis_ = null;
  }
  if (this.waveform_) {
    this.group_.svg.removeChild(this.waveform_);
    this.waveform_ = null;
  }
  if (!this.oscillator_.enabledSetting.value)
    return;

  this.axis_ = SVGUtils.createLine(0, kMid.y,
                                   kBounds.x, kMid.y,
                                   kAxisColor, 1,
                                   this.group_.svgDoc, this.group_.svg);

  switch (this.oscillator_.typeSetting.value) {
    case Instrument.kSineWave: this.drawSineWave_(); break;
    case Instrument.kSquareWave: this.drawSquareWave_(); break;
    case Instrument.kSawtoothWave: this.drawSawtoothWave_(); break;
    case Instrument.kTriangleWave: this.drawTriangleWave_(); break;
  }
}
*/

return module;

})();
