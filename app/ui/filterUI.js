FilterUI = (function() {

"use strict";
var module = {};

module.FilterVisualizer_ = function(container, filter, displaySettings, onchange) {
  CategoryUI.CategoryVisualizer.call(this, container, displaySettings, onchange);
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
  var magPoints = new SVGUI.PointList();
  var response = this.filter_.getFrequencyResponse(kFreqOctave,
                                                   kFreqNote,
                                                   this.currentTime(),
                                                   this.displaySettings.noteOnTimeSetting.value,
                                                   kHarmonics,
                                                   this.xSize - 2 * kXPadding);
  var yBottom = this.ySize - kYPadding;
  for (var i = 0; i < response.mag.length; i++) {
    var x = kXPadding + i + kXFudge;
    var magY = kYScale * response.mag[i] * (this.ySize - 2 * kYPadding);
    magPoints.addPoint(x, yBottom - magY);
  }
  this.svg.drawPolyLine(magPoints, kResponseStroke, kResponseStrokeWidth, "none")
  //var xAxisY = kBounds.y * maxMag / magRange;
  //SVGUtils.addPointToArray(kBounds.x - kXPadding, kBounds.y, magPoints);
  //SVGUtils.addPointToArray(kXPadding, kBounds.y, magPoints);
  //this.response_.push(SVGUtils.createPolyLine(magPoints,
  //                                            "none", 0, kResponseFlat,
  //                                            this.group_.svgDoc, this.group_.svg));
  //this.response_.push(SVGUtils.createLine(kXPadding + response.filterIndex, 0,
  //                                        kXPadding + response.filterIndex, kBounds.y,
  //                                        kResponseColor, kAxisWidth,
  //                                        this.group_.svgDoc, this.group_.svg));
  //magPoints.pop();
  //magPoints.pop();
  //this.response_.push(SVGUtils.createPolyLine(magPoints,
  //                                            kResponseColor, kResponseWidth, "none",
  //                                            this.group_.svgDoc, this.group_.svg));
  //this.response_.push(SVGUtils.createPolyLine(phasePoints,
  //                                            kPhaseColor, kPhaseWidth, "none",
  //                                            this.group_.svgDoc, this.group_.svg));
}

var kTypeDescriptions = {};
kTypeDescriptions[Instrument.kLowPassFilter] = Strings.kLowPass;
kTypeDescriptions[Instrument.kHighPassFilter] = Strings.kHighPass;

module.UI = function(id, filter, instrument, title, categoriesEl, detailsEl, selected) {
  CategoryUI.UI.call(this, id, title, categoriesEl, detailsEl, selected);
  this.filter_ = filter;

  var ui = this;
  var changeHandler = function() {
    ui.frequencyContourPanel.setCurrentTime(ui.visualizer_.currentTime());
    ui.updateDisplay_();
  }
  this.visualizer_ = new module.FilterVisualizer_(this.titleRow.controlDiv, filter,
                                                  instrument.displaySettings, changeHandler);

  new SettingsUI.CheckRow(this.settings, Strings.kEnabled, changeHandler, filter.enabledSetting);

  this.enablePanel_ = new SettingsUI.Panel(this.settings);
  new SettingsUI.SelectRow(this.enablePanel_, Strings.kType, changeHandler, filter.typeSetting, kTypeDescriptions);
  this.frequencyContourPanel = new ContourUI.ContourPanel(this.enablePanel_, Strings.kFrequency,
                                   changeHandler, filter.frequencyContour, instrument,
                                   Strings.kMultiplierFormatter, 190);
  new SettingsUI.LinearRangeRow(this.enablePanel_, Strings.kQ, changeHandler, filter.qSetting, null, 20);

  this.response_ = [];
  this.updateDisplay_();
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

/*
var kBounds = SettingsUI.kDisplayBounds;
var kMid = SettingsUI.kDisplayMid;
var kXPadding = 12.5;
var kXRange = kBounds.x - (2 * kXPadding);
var kMaxMagPadding = 1;
var kMinMag = -20;
var kFreqStart = 200;
var kFreqEnd = 5000;
var kFreqOctave = 4;
var kFreqNote = 0;
var kAxisColor = "#999";
var kAxisWidth = 1;
var kOddHarmonicColor = "#BBB";
var kEvenHarmonicColor = "#AAA";
var kResponseColor = "#008000";
var kResponseWidth = 2;
var kResponseFlat = "#90B090";
var kPhaseWidth = 1;
var kPhaseColor = "magenta";

module.UI.prototype.drawBackground_ = function(response, xAxisY) {
  this.response_.push(SVGUtils.createLine(0, xAxisY + 0.5,
                                          kBounds.x, xAxisY + 0.5,
                                          kAxisColor, kAxisWidth,
                                          this.group_.svgDoc, this.group_.svg));
  this.response_.push(SVGUtils.createLine(kXPadding, 0,
                                          kXPadding, kBounds.y,
                                          kAxisColor, kAxisWidth,
                                          this.group_.svgDoc, this.group_.svg));
  for (var i = 0; i < response.numHarmonics; i++) {
    var noteIndex = response.harmonics[i];
    var color = kEvenHarmonicColor;
    if (i % 2 == 1)
      color = kOddHarmonicColor;
    this.response_.push(SVGUtils.createLine(kXPadding + noteIndex, 0,
                                            kXPadding + noteIndex, kBounds.y,
                                            color, kAxisWidth,
                                            this.group_.svgDoc, this.group_.svg));
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
  if (!this.filter_.enabledSetting.value)
    return;

  var magPoints = [];
  var phasePoints = [];
  var response = this.filter_.getFrequencyResponse(kFreqOctave,
                                                   kFreqNote,
                                                   kFreqStart,
                                                   kFreqEnd,
                                                   kXRange);
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
                                              "none", 0, kResponseFlat,
                                              this.group_.svgDoc, this.group_.svg));
  this.drawBackground_(response, xAxisY);
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

*/

return module;

})();
