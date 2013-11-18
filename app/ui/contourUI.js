ContourUI = (function() {

"use strict";
var module = {};

module.ContourVisualizer_ = function(container, contouredValue) {
  SVGUI.SVGControl.call(this, container);
  this.div.classList.add('contourDisplay');
  this.contouredValue_ = contouredValue;
  this.currentTime = 0;
  this.noteDuration = 0;
  this.releaseTime = 0;
}

module.ContourVisualizer_.prototype = Object.create(SVGUI.SVGControl.prototype);

var kXSize = UIConstants.visualizationWidth;
var kYSize = 50;
var kXPadding = 0;
var kYPadding = 4;
var kXStep = 0.5;
var kXFudge = 0.5
var kBackgroundStroke = "#CCCCCC";
var kBackgroundStrokeWidth = 2;
var kBackgroundFill = "none";
var kReleaseBackgroundStroke = "none";
var kReleaseBackgroundStrokeWidth = 1;
var kReleaseBackgroundFill = "#F5F5F5";
var kContourStroke = "#4040A0";
var kContourStrokeWidth = 2;
var kContourFill = "none";
var kCurrentTimeStroke = "#DDDDDD";
var kCurrentTimeStrokeWidth = 1;
var kSecondStroke = "#EEEEEE";
var kSecondStrokeWidth = 1;
var kTenthSecondStroke = "#E8E8E8";
var kTenthSecondStrokeWidth = 0.5;
var kTenthSecondMinGap = 3;

module.ContourVisualizer_.prototype.drawContour = function() {
  this.clear();
  this.drawRect(0, 0, kXSize, kYSize, kBackgroundStroke, kBackgroundStrokeWidth, kBackgroundFill);
  var totalTime = this.noteDuration + this.releaseTime;
  if (totalTime == 0)
    return;

  var padding = kBackgroundStrokeWidth / 2
  var releaseXStart = (kXSize - 2 * padding) * this.noteDuration / totalTime;
  this.drawRect(releaseXStart, padding,
                kXSize - releaseXStart - padding,
                kYSize - 2 * padding, kReleaseBackgroundStroke,
                kReleaseBackgroundStrokeWidth, kReleaseBackgroundFill);

  var baseTenthSecondXGap = (kXSize - 2 * padding) / (totalTime * 10);
  if (baseTenthSecondXGap >= kTenthSecondMinGap) {
    var currentX = padding + baseTenthSecondXGap;
    while (currentX < kXSize - padding) {
      this.drawLine(currentX, padding, currentX, kYSize - padding,
                    kTenthSecondStroke, kTenthSecondStrokeWidth);
      currentX += baseTenthSecondXGap;
    }
  }

  var baseSecondXGap = (kXSize - 2 * padding) / totalTime;
  currentX = padding + baseSecondXGap;
  while (currentX < kXSize - padding) {
    this.drawLine(currentX, padding, currentX, kYSize - padding,
                  kSecondStroke, kSecondStrokeWidth);
    currentX += baseSecondXGap;
  }

  var currentTimeX = kXPadding + kXFudge + (kXSize - 2 * kXPadding) * this.currentTime / totalTime;
  this.drawLine(currentTimeX, 0, currentTimeX, kYSize,
                kCurrentTimeStroke, kCurrentTimeStrokeWidth);
  var pointList = new SVGUI.PointList();
  var pointCount = (kXSize - 2 * kXPadding) / kXStep;
  for (var i = 0; i < pointCount; i++) {
    var x = kXPadding + (i * kXStep);
    var time = totalTime * i / pointCount;
    var value = this.contouredValue_.valueAtTime(time, this.noteDuration);
    var relativeValue = (value - this.contouredValue_.min) /
                        (this.contouredValue_.max - this.contouredValue_.min);
    var y = kYSize - kYPadding - relativeValue * (kYSize - 2 * kYPadding);
    pointList.addPoint(x, y);
  }
  this.drawPolyLine(pointList, kContourStroke, kContourStrokeWidth, kContourFill);
}

module.ContourTypePanel_ = function(container, onchange, formatter, steps) {
  UI.Panel.call(this, container);
  this.onchange = onchange;
  this.formatter = formatter;
  this.steps = steps;
}

module.ContourTypePanel_.prototype = Object.create(UI.Panel.prototype);

module.ContourTypePanel_.prototype.setVisible = function(visible) {
  UI.Panel.prototype.setVisible.call(this, visible);
  if (visible) {
    this.children.forEach(function(row) {
      row.updateControl();
    });
  }
}

module.ContourTypePanel_.prototype.createValueRow_ = function(title, setting) {
  return new SettingsUI.LinearRangeRow(this, title, this.onchange, setting, this.formatter, this.steps);
}

module.ContourTypePanel_.prototype.createTimeRow_ = function(title, setting) {
  return new SettingsUI.ExponentialRangeRow(this, title, this.onchange, setting, Strings.kSecondsFormatter, 10);
}

module.FlatContourPanel_ = function(container, onchange, flatContour, isEnvelope,
                                    formatter, steps) {
  module.ContourTypePanel_.call(this, container, onchange, formatter, steps);
  if (!isEnvelope)
    this.createValueRow_(Strings.kValue, flatContour.valueSetting);
}

module.FlatContourPanel_.prototype = Object.create(module.ContourTypePanel_.prototype);

module.OscillatingContourPanel_ = function(container, onchange, oscillatingContour,
                                           isEnvelope, formatter, steps) {
  module.ContourTypePanel_.call(this, container, onchange, formatter, steps);
  new SettingsUI.SelectRow(this, Strings.kOscillation, onchange, oscillatingContour.typeSetting, Strings.kOscillatorTypeDescriptions);
  if (!isEnvelope)
    this.createValueRow_(Strings.kMax, oscillatingContour.maxValueSetting);
  this.createValueRow_(Strings.kMin, oscillatingContour.minValueSetting);
  new SettingsUI.ExponentialRangeRow(this, Strings.kSpeed, onchange,
                                     oscillatingContour.frequencySetting, null, 20);
}

module.OscillatingContourPanel_.prototype = Object.create(module.ContourTypePanel_.prototype);

module.ADSRContourPanel_ = function(container, onchange, adsrContour,
                                    isEnvelope, formatter, steps) {
  module.ContourTypePanel_.call(this, container, onchange, formatter, steps);
  if (!isEnvelope)
    this.createValueRow_(Strings.kInitialValue, adsrContour.initialValueSetting);
  this.createTimeRow_(Strings.kAttackTime, adsrContour.attackTimeSetting);
  this.createValueRow_(Strings.kAttackValue, adsrContour.attackValueSetting);
  this.createTimeRow_(Strings.kDecayTime, adsrContour.decayTimeSetting);
  this.createValueRow_(Strings.kSustainValue, adsrContour.sustainValueSetting);
  this.createTimeRow_(Strings.kReleaseTime, adsrContour.releaseTimeSetting);
  if (!isEnvelope)
    this.createValueRow_(Strings.kFinalValue, adsrContour.finalValueSetting);
}

module.ADSRContourPanel_.prototype = Object.create(module.ContourTypePanel_.prototype);

module.NStageContourPanel_ = function(container, onchange, onstructurechange, nStageContour,
                                      isEnvelope, formatter, steps) {
  module.ContourTypePanel_.call(this, container, onchange, formatter, steps);
  this.nStageContour_ = nStageContour;
  var panel = this;
  var numStagesChanged = function() {
    panel.showHideStages_();
    onstructurechange();
  }
  new SettingsUI.LinearRangeRow(this, Strings.kNumberOfStages, numStagesChanged, nStageContour.numStagesSetting,
                                null, Contour.kMaxIntermediateStages);
  if (!isEnvelope) {
    this.createValueRow_(Strings.kInitialValue, nStageContour.initialValueSetting);
  }
  this.createTimeRow_(Strings.kStage1Duration, nStageContour.firstStageTimeSetting);
  this.intermediateStageBeginRows = [];
  this.intermediateStageDurationRows = [];
  for (var i = 0; i < Contour.kMaxIntermediateStages; i++) {
    this.intermediateStageBeginRows.push(
        this.createValueRow_(Strings.kIntermediateStageBeginValues[i],
                             nStageContour.intermediateStages[i].beginValueSetting));
    this.intermediateStageDurationRows.push(
        this.createTimeRow_(Strings.kIntermediateStageDurations[i],
                            nStageContour.intermediateStages[i].durationSetting));
  }
  this.createValueRow_(Strings.kSustainValue, nStageContour.sustainValueSetting);
  this.createTimeRow_(Strings.kReleaseTime, nStageContour.releaseTimeSetting);
  if (!isEnvelope) {
    this.createValueRow_(Strings.kFinalValue, nStageContour.finalValueSetting);
  }
  this.showHideStages_();
}

module.NStageContourPanel_.prototype = Object.create(module.ContourTypePanel_.prototype);

module.NStageContourPanel_.prototype.showHideStages_ = function() {
  var numIntermediateStages = this.nStageContour_.numStagesSetting.value - Contour.kMinStages;
  for (var i = 0; i < Contour.kMaxIntermediateStages; i++) {
    this.intermediateStageBeginRows[i].setVisible(i < numIntermediateStages);
    this.intermediateStageDurationRows[i].setVisible(i < numIntermediateStages);
  }
}

module.ContourPanel = function(container, title, onchange, onsizechange, contouredValue, instrument,
                               formatter, steps, asCategory, selected) {
  UI.Panel.call(this, container);

  this.contouredValue_ = contouredValue;
  this.onchange = onchange;
  this.onsizechange = onsizechange;

  this.contourRow_ = new SettingsUI.Row(this, title, null);

  this.visualizer_ = new module.ContourVisualizer_(this.contourRow_.controlDiv, contouredValue);
  this.selectPanel_ = new UI.Panel(this);

  var contourGroup = this;
  if (asCategory) {
    this.contourRow_.label.classList.add('categoryName');
  } else {
    this.contourRow_.div.classList.add('contourPanelRow');
    this.selectPanel_.div.classList.add('contourPanel');
    this.contourRow_.div.onclick = function() {
      contourGroup.setSelected(!contourGroup.selected_);
      if (contourGroup.onsizechange)
        contourGroup.onsizechange();
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
  var structureChangeHandler = function() {
    changeHandler();
    if (contourGroup.onsizechange)
      contourGroup.onsizechange();
  }
  new SettingsUI.SelectRow(this.selectPanel_,
                           Strings.kType,
                           structureChangeHandler,
                           contouredValue.currentContourSetting,
                           Strings.kContourTypeDescriptions);
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
  this.nStagePanel_ = new module.NStageContourPanel_(
      this.selectPanel_, changeHandler, structureChangeHandler,
      contouredValue.contoursByIdentifier[Contour.kNStageContour],
      contouredValue.isEnvelope, formatter, steps);

  this.showHideContours_();
  this.setSelected(selected);
}

module.ContourPanel.prototype = Object.create(UI.Panel.prototype);

module.ContourPanel.prototype.showHideContours_ = function() {
  var current = this.contouredValue_.currentContourSetting.value
  this.flatPanel_.setVisible(current == Contour.kFlatContour);
  this.oscillatingPanel_.setVisible(current == Contour.kOscillatingContour);
  this.adsrPanel_.setVisible(current == Contour.kADSRContour);
  this.nStagePanel_.setVisible(current == Contour.kNStageContour);
}

module.ContourPanel.prototype.setSelected = function(selected) {
  this.selected_ = selected;
  if (selected)
    this.contourRow_.div.classList.add('selected');
  else
    this.contourRow_.div.classList.remove('selected');
  this.selectPanel_.setVisible(selected);
}

module.ContourPanel.prototype.currentTime = function() {
  return this.visualizer_.currentTime;
}

module.ContourPanel.prototype.setCurrentTime = function(currentTime, noteDuration, releaseTime) {
  this.visualizer_.currentTime = currentTime;
  this.visualizer_.noteDuration = noteDuration;
  this.visualizer_.releaseTime = releaseTime;
}

module.ContourPanel.prototype.drawContour = function() {
  this.visualizer_.drawContour();
}

return module;

})();