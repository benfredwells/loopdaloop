ContourUI = (function() {

"use strict";
var module = {};

module.ContourVisualizer_ = function(container, contouredValue) {
  SVGUI.SVGControl.call(this, container);
  this.div.classList.add('contourDisplay');
  this.contouredValue_ = contouredValue;
  this.currentTime = 0;
  this.noteOnTime_ = 0;
  this.releaseTime_ = 0;
}

module.ContourVisualizer_.prototype = Object.create(SVGUI.SVGControl.prototype);

var kXSize = 200;
var kYSize = 50;
var kXPadding = 0;
var kYPadding = 4;
var kXStep = 0.5;
var kXFudge = 0.5
var kBackgroundStroke = "#CCCCCC";
var kBackgroundStrokeWidth = 2;
var kBackgroundFill = "none";
var kContourStroke = "#4040A0";
var kContourStrokeWidth = 2;
var kContourFill = "none";
var kCurrentTimeStroke = "#DDDDDD";
var kCurrentTimeStrokeWidth = 1;

module.ContourVisualizer_.prototype.drawContour = function() {
  this.clear();
  this.drawRect(0, 0, kXSize, kYSize, kBackgroundStroke, kBackgroundStrokeWidth, kBackgroundFill);
  var totalTime = this.noteOnTime_ + this.releaseTime_;
  var currentTimeX = kXPadding + kXFudge + (kXSize - 2 * kXPadding) * this.currentTime / totalTime;
  this.drawLine(currentTimeX, 0, currentTimeX, kYSize,
                kCurrentTimeStroke, kCurrentTimeStrokeWidth);
  var pointList = new SVGUI.PointList();
  var pointCount = (kXSize - 2 * kXPadding) / kXStep;
  for (var i = 0; i < pointCount; i++) {
    var x = kXPadding + (i * kXStep);
    var time = totalTime * i / pointCount;
    var value = this.contouredValue_.valueAtTime(time, this.noteOnTime_);
    var relativeValue = (value - this.contouredValue_.min) /
                        (this.contouredValue_.max - this.contouredValue_.min);
    var y = kYSize - kYPadding - relativeValue * (kYSize - 2 * kYPadding);
    pointList.addPoint(x, y);
  }
  this.drawPolyLine(pointList, kContourStroke, kContourStrokeWidth, kContourFill);
}

module.FlatContourPanel_ = function(container, onchange, flatContour, isEnvelope,
                                    formatter, steps) {
  SettingsUI.Panel.call(this, container);
  if (!isEnvelope)
    new SettingsUI.LinearRangeRow(this, Strings.kValue, onchange,
                                  flatContour.valueSetting, formatter, steps);
}

module.FlatContourPanel_.prototype = Object.create(SettingsUI.Panel.prototype);

module.OscillatingContourPanel_ = function(container, onchange, oscillatingContour,
                                           isEnvelope, formatter, steps) {
  SettingsUI.Panel.call(this, container);
  if (!isEnvelope) {
    new SettingsUI.LinearRangeRow(this, Strings.kMax, onchange,
                                  oscillatingContour.maxValueSetting, formatter, steps);
  }
  new SettingsUI.LinearRangeRow(this, Strings.kMin, onchange,
                                oscillatingContour.minValueSetting, formatter, steps);
  new SettingsUI.ExponentialRangeRow(this, Strings.kSpeed, onchange,
                                     oscillatingContour.frequencySetting, null, 20);
}

module.OscillatingContourPanel_.prototype = Object.create(SettingsUI.Panel.prototype);

module.ADSRContourPanel_ = function(container, onchange, adsrContour,
                                    isEnvelope, formatter, steps) {
  SettingsUI.Panel.call(this, container);

  var contourPanel = this;
  var createValueRow = function(title, setting) {
    new SettingsUI.LinearRangeRow(contourPanel, title, onchange, setting, formatter, steps);
  }
  var createTimeRow = function(title, setting) {
    new SettingsUI.ExponentialRangeRow(contourPanel, title, onchange, setting, Strings.kSecondsFormatter, 10);
  }
  if (!isEnvelope) {
    createValueRow(Strings.kInitialValue, adsrContour.initialValueSetting);
    createTimeRow(Strings.kAttackDelay, adsrContour.attackDelaySetting);
  }
  createTimeRow(Strings.kAttackTime, adsrContour.attackTimeSetting);
  if (!isEnvelope) {
    createValueRow(Strings.kAttackValue, adsrContour.attackValueSetting);
  }
  createTimeRow(Strings.kAttackHold, adsrContour.attackHoldSetting);
  createTimeRow(Strings.kDecayTime, adsrContour.decayTimeSetting);
  createValueRow(Strings.kSustainValue, adsrContour.sustainValueSetting);
  createTimeRow(Strings.kSustainHold, adsrContour.sustainHoldSetting);
  createTimeRow(Strings.kReleaseTime, adsrContour.releaseTimeSetting);
  if (!isEnvelope) {
    createValueRow(Strings.kFinalValue, adsrContour.finalValueSetting);
  }
}

module.ADSRContourPanel_.prototype = Object.create(SettingsUI.Panel.prototype);

var kTypeDescriptions = {};
kTypeDescriptions[Contour.kFlatContour] = Strings.kFlat;
kTypeDescriptions[Contour.kOscillatingContour] = Strings.kOscillating;
kTypeDescriptions[Contour.kADSRContour] = Strings.kADSR;

module.ContourPanel = function(container, title, onchange, contouredValue, instrument,
                               formatter, steps, asCategory, selected) {
  SettingsUI.Panel.call(this, container);

  this.contouredValue_ = contouredValue;
  this.onchange = onchange;

  this.contourRow_ = new SettingsUI.Row(this, title, null);

  this.visualizer_ = new module.ContourVisualizer_(this.contourRow_.controlDiv, contouredValue);
  this.selectPanel_ = new SettingsUI.Panel(this);

  var contourGroup = this;
  if (asCategory) {
    this.contourRow_.label.classList.add('categoryName');
  } else {
    this.contourRow_.div.classList.add('contourPanelRow');
    this.selectPanel_.div.classList.add('contourPanel');
    this.contourRow_.div.onclick = function() {
      contourGroup.setSelected(!contourGroup.selected_);
    }

    this.contourRow_.div.onmouseenter = function() {
      this.classList.add('hover');
    }

    this.contourRow_.div.onmouseleave = function() {
      this.classList.remove('hover');
    }
  }

  var changeHandler = function() {
    contourGroup.showHideContours_();
    contourGroup.visualizer_.drawContour();
    if (contourGroup.onchange)
      contourGroup.onchange();
  }
  new SettingsUI.SelectRow(this.selectPanel_,
                           Strings.kType,
                           changeHandler,
                           contouredValue.currentContourSetting,
                           kTypeDescriptions);
  this.flatPanel_ = new module.FlatContourPanel_(
      this.selectPanel_, changeHandler,
      contouredValue.contoursByIdentifier[Contour.kFlatContour],
      contouredValue.isEnvelope, formatter, steps);
  this.oscillatingPanel_ = new module.OscillatingContourPanel_(
      this.selectPanel_, changeHandler,
      contouredValue.contoursByIdentifier[Contour.kOscillatingContour],
      contouredValue.isEnvelope, formatter, steps);
  this.adsrPanel_ = new module.ADSRContourPanel_(
      this.selectPanel_, changeHandler,
      contouredValue.contoursByIdentifier[Contour.kADSRContour],
      contouredValue.isEnvelope, formatter, steps);

  this.showHideContours_();
  this.setSelected(selected);
}

module.ContourPanel.prototype = Object.create(SettingsUI.Panel.prototype);

module.ContourPanel.prototype.showHideContours_ = function() {
  var current = this.contouredValue_.currentContourSetting.value
  this.flatPanel_.setVisible(current == Contour.kFlatContour);
  this.oscillatingPanel_.setVisible(current == Contour.kOscillatingContour);
  this.adsrPanel_.setVisible(current == Contour.kADSRContour);
}

module.ContourPanel.prototype.setSelected = function(selected) {
  this.selected_ = selected;
  if (selected)
    this.contourRow_.div.classList.add('selected');
  else
    this.contourRow_.div.classList.remove('selected');
  this.selectPanel_.setVisible(selected);
}

module.ContourPanel.prototype.setCurrentTime = function(currentTime, noteOnTime, releaseTime) {
  this.visualizer_.currentTime = currentTime;
  this.visualizer_.noteOnTime_ = noteOnTime;
  this.visualizer_.releaseTime_ = releaseTime;
}

module.ContourPanel.prototype.drawContour = function() {
  this.visualizer_.drawContour();
}

return module;

})();