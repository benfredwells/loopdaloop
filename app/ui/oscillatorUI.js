OscillatorUI = (function() {

"use strict";
var module = {};

module.OscillatorVisualizer_ = function(container, oscillator, onchange) {
  CategoryUI.CategoryVisualizer.call(this, container, onchange);
  this.oscillator_ = oscillator;
}

module.OscillatorVisualizer_.prototype = Object.create(CategoryUI.CategoryVisualizer.prototype);

var kXPadding = 0;
var kYPadding = 1;
var kHarmonics = (UIConstants.visualizationWidth / 9);
var kXFudge = 0.5; // To keep base harmonics aligned on pixels :-/
var kYScale = 0.7;
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
  CategoryUI.CategoryVisualizer.prototype.drawVisualization.call(this);
  var baseHarmonicXGap = (this.xSize - 2 * kXPadding) / kHarmonics;
  var currentX = kXPadding + baseHarmonicXGap + kXFudge;
  while (currentX < this.xSize - kXPadding) {
    this.svg.drawLine(currentX, kYPadding, currentX, this.ySize - kYPadding,
                      kHarmonicBackgroundStroke, kHarmonicBackgroundStrokeWidth);
    currentX += baseHarmonicXGap;
  }
  this.drawTime();
  if (!this.oscillator_.enabledSetting.value)
    return;

  var yBottom = this.ySize - kYPadding;
  var gain = this.oscillator_.gainContour.valueAtTime(this.currentTime(), this.noteDuration);
  var freqeuencyAdjust = ChromaticScale.frequencyAdjustmentFactor(
      this.oscillator_.octaveOffsetSetting.value,
      this.oscillator_.noteOffsetSetting.value,
      this.oscillator_.detuneSetting.value);
  var noteHarmonicXGap = baseHarmonicXGap * freqeuencyAdjust;
  currentX = kXPadding + noteHarmonicXGap + kXFudge;
  var harmonic = 1;
  while (currentX < this.xSize - kXPadding) {
    var height = gain * this.harmonicAmplitude_(harmonic) * (this.ySize - 2 * kYPadding) * kYScale;
    this.svg.drawLine(currentX, yBottom, currentX, yBottom - height,
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

module.UI = function(id, oscillator, instrument, title, categoriesEl, detailsEl, ontimechange) {
  CategoryUI.UI.call(this, id, title, categoriesEl, detailsEl, false);
  this.oscillator_ = oscillator;

  this.visualizer_ = new module.OscillatorVisualizer_(this.titleRow.controlDiv, oscillator, ontimechange);

  var ui = this;
  var changeHandler = function() {
    ui.updateDisplay_();
  }
  var sizeChangeHandler = function() {
    if (ui.onsizechange)
      ui.onsizechange(ui);
  }
  var enabledChangeHandler = function() {
    changeHandler();
    sizeChangeHandler();
  }
  new SettingsUI.CheckRow(this.settings, Strings.kEnabled, enabledChangeHandler, oscillator.enabledSetting);

  this.enablePanel_ = new UI.Panel(this.settings);
  new SettingsUI.SelectRow(this.enablePanel_, Strings.kType, changeHandler, oscillator.typeSetting, kTypeDescriptions);
  new SettingsUI.LinearRangeRow(this.enablePanel_, Strings.kOctaveOffset, changeHandler, oscillator.octaveOffsetSetting, null, 8);
  new SettingsUI.LinearRangeRow(this.enablePanel_, Strings.kNoteOffset, changeHandler, oscillator.noteOffsetSetting, null, 16);
  new SettingsUI.LinearRangeRow(this.enablePanel_, Strings.kDetune, changeHandler, oscillator.detuneSetting, String.kPercentFormatter, 100);
  this.gainContourPanel = new ContourUI.ContourPanel(this.enablePanel_, Strings.kGain,
                                                     changeHandler, sizeChangeHandler, oscillator.gainContour, instrument,
                                                     null, 10, false, false);
}

module.UI.prototype = Object.create(CategoryUI.UI.prototype);

module.UI.prototype.updateDisplay_ = function() {
  this.enablePanel_.setEnabled(this.oscillator_.enabledSetting.value);;
  this.updateIcon();
  this.visualizer_.drawVisualization();
  this.gainContourPanel.drawContour();
}

module.UI.prototype.updateIcon = function() {
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

module.UI.prototype.setCurrentTime = function(time, noteDuration, releaseTime) {
  this.gainContourPanel.setCurrentTime(time, noteDuration, releaseTime);
  this.visualizer_.setCurrentTime(time, noteDuration, releaseTime);
  if (this.isSelected())
    this.updateDisplay_();
}

module.UI.prototype.setSelected = function(selected) {
  CategoryUI.UI.prototype.setSelected.call(this, selected);
  if (selected) {
    this.updateDisplay_();
  }
}

return module;

})();
