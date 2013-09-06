FilterUI = (function() {

"use strict";
var module = {};

module.FilterVisualizer_ = function(container, filter, onchange) {
  CategoryUI.CategoryVisualizer.call(this, container, onchange);
  this.filter_ = filter;
}

module.FilterVisualizer_.prototype = Object.create(CategoryUI.CategoryVisualizer.prototype);

var kXPadding = 0;
var kYPadding = 1;
var kHarmonics = (200 / 9);
var kXFudge = 0.5; // To keep base harmonics aligned on pixels :-/
var kYScale = 0.7;
var kHarmonicBackgroundStroke = "#DDDDDD";
var kHarmonicBackgroundStrokeWidth = 1;
var kResponseStroke = "#008000";
var kResponseStrokeWidth = 2;
var kFreqOctave = 4;
var kFreqNote = 0;

module.FilterVisualizer_.prototype.drawVisualization = function() {
  CategoryUI.CategoryVisualizer.prototype.drawVisualization.call(this);
  var baseHarmonicXGap = (this.xSize - 2 * kXPadding) / kHarmonics;
  var currentX = kXPadding + baseHarmonicXGap + kXFudge;
  while (currentX < this.xSize - kXPadding) {
    this.svg.drawLine(currentX, kYPadding, currentX, this.ySize - kYPadding,
                      kHarmonicBackgroundStroke, kHarmonicBackgroundStrokeWidth);
    currentX += baseHarmonicXGap;
  }
  this.drawTime();
  if (!this.filter_.enabledSetting.value)
    return;

  var magPoints = new SVGUI.PointList();
  var response = this.filter_.getFrequencyResponse(kFreqOctave,
                                                   kFreqNote,
                                                   this.currentTime(),
                                                   this.noteDuration,
                                                   kHarmonics,
                                                   this.xSize - 2 * kXPadding);
  var yBottom = this.ySize - kYPadding;
  for (var i = 0; i < response.mag.length; i++) {
    var x = kXPadding + i + kXFudge;
    var magY = kYScale * response.mag[i] * (this.ySize - 2 * kYPadding);
    magPoints.addPoint(x, yBottom - magY);
  }
  this.svg.drawPolyLine(magPoints, kResponseStroke, kResponseStrokeWidth, "none")
}

var kTypeDescriptions = {};
kTypeDescriptions[Instrument.kLowPassFilter] = Strings.kLowPass;
kTypeDescriptions[Instrument.kHighPassFilter] = Strings.kHighPass;

module.UI = function(id, filter, instrument, title, categoriesEl, detailsEl, ontimechange) {
  CategoryUI.UI.call(this, id, title, categoriesEl, detailsEl, false);
  this.filter_ = filter;

  this.visualizer_ = new module.FilterVisualizer_(this.titleRow.controlDiv, filter, ontimechange);

  var ui = this;
  var changeHandler = function() {
    ui.updateDisplay_();
  }
  new SettingsUI.CheckRow(this.settings, Strings.kEnabled, changeHandler, filter.enabledSetting);

  this.enablePanel_ = new UI.Panel(this.settings);
  new SettingsUI.SelectRow(this.enablePanel_, Strings.kType, changeHandler, filter.typeSetting, kTypeDescriptions);
  this.frequencyContourPanel = new ContourUI.ContourPanel(this.enablePanel_, Strings.kFrequency,
                                                          changeHandler, filter.frequencyContour, instrument,
                                                          Strings.kMultiplierFormatter, 190, false, false);
  new SettingsUI.LinearRangeRow(this.enablePanel_, Strings.kQ, changeHandler, filter.qSetting, null, 20);

  this.response_ = [];
}

module.UI.prototype = Object.create(CategoryUI.UI.prototype);

module.UI.prototype.updateDisplay_ = function() {
  this.enablePanel_.setEnabled(this.filter_.enabledSetting.value);;
  this.updateIcon_();
  this.visualizer_.drawVisualization();
  this.frequencyContourPanel.drawContour();
}

module.UI.prototype.updateIcon_ = function() {
  var iconClass;
  if (this.filter_.enabledSetting.value) {
    switch (this.filter_.typeSetting.value) {
      case Instrument.kLowPassFilter: iconClass = 'lowPassFilterIcon'; break;
      case Instrument.kHighPassFilter: iconClass = 'highPassFilterIcon'; break;
    }
  } else {
    iconClass = 'disabledFilterIcon';
  }
  this.setIconClass(iconClass);
}

module.UI.prototype.setCurrentTime = function(time, noteDuration, releaseTime) {
  this.frequencyContourPanel.setCurrentTime(time, noteDuration, releaseTime);
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
