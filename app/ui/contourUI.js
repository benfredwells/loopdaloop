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
      row.updateDisplay();
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

module.OscillatingContourPanel_ = function(container, onchange, onstructurechange, 
                                           oscillatingContour,
                                           isEnvelope, formatter, steps) {
  module.ContourTypePanel_.call(this, container, onchange, formatter, steps);
  this.oscillatingContour_ = oscillatingContour;
  var panel = this;
  var typeChanged = function() {
    panel.showHideTimeConstant_();
    onstructurechange();
  }
  new SettingsUI.SelectRow(this, Strings.kType, typeChanged, oscillatingContour.typeSetting, Strings.kOscillationTypeDescriptions);
  this.timeConstantRow_ = new SettingsUI.ExponentialRangeRow(
      this, Strings.kTimeConstant, onchange,
      oscillatingContour.timeConstantSetting,
      Strings.kSecondsFormatter, 20);
  new SettingsUI.SelectRow(this, Strings.kWave, onchange, oscillatingContour.waveSetting, Strings.kOscillatorTypeDescriptions);
  if (!isEnvelope)
    this.createValueRow_(Strings.kMax, oscillatingContour.maxValueSetting);
  this.createValueRow_(Strings.kMin, oscillatingContour.minValueSetting);
  new SettingsUI.ExponentialRangeRow(this, Strings.kSpeed, onchange,
                                     oscillatingContour.frequencySetting, null, 20);
  this.showHideTimeConstant_();
}

module.OscillatingContourPanel_.prototype = Object.create(module.ContourTypePanel_.prototype);

module.OscillatingContourPanel_.prototype.showHideTimeConstant_ = function() {
  this.timeConstantRow_.setVisible(this.oscillatingContour_.typeSetting.value != AudioConstants.kConstantOscillation);
}

module.SweepContourPanel_ = function(container, onchange, sweepContour,
                                    isEnvelope, formatter, steps) {
  module.ContourTypePanel_.call(this, container, onchange, formatter, steps);
  this.createValueRow_(Strings.kInitialValue, sweepContour.initialValueSetting);
  this.createTimeRow_(Strings.kSweepTime, sweepContour.sweepTimeSetting);
  this.createValueRow_(Strings.kSweepEndValue, sweepContour.finalValueSetting);
}

module.SweepContourPanel_.prototype = Object.create(module.ContourTypePanel_.prototype);

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
                                null, AudioConstants.kMaxIntermediateStages);
  if (!isEnvelope) {
    this.createValueRow_(Strings.kInitialValue, nStageContour.initialValueSetting);
  }
  this.createTimeRow_(Strings.kStage1Duration, nStageContour.firstStageTimeSetting);
  this.intermediateStageBeginRows = [];
  this.intermediateStageDurationRows = [];
  for (var i = 0; i < AudioConstants.kMaxIntermediateStageValues; i++) {
    this.intermediateStageBeginRows.push(
        this.createValueRow_(Strings.kIntermediateStageBeginValues[i],
                             nStageContour.intermediateStages[i].beginValueSetting));
    this.intermediateStageDurationRows.push(
        this.createTimeRow_(Strings.kIntermediateStageDurations[i],
                            nStageContour.intermediateStages[i].durationSetting));
  }
  this.createTimeRow_(Strings.kReleaseTime, nStageContour.releaseTimeSetting);
  if (!isEnvelope) {
    this.createValueRow_(Strings.kFinalValue, nStageContour.finalValueSetting);
  }
  this.showHideStages_();
}

module.NStageContourPanel_.prototype = Object.create(module.ContourTypePanel_.prototype);

module.NStageContourPanel_.prototype.showHideStages_ = function() {
  var numIntermediateStages = this.nStageContour_.numStagesSetting.value - AudioConstants.kMinStages;
  for (var i = 0; i < AudioConstants.kMaxIntermediateStageValues; i++) {
    this.intermediateStageBeginRows[i].setVisible(i < numIntermediateStages);
    this.intermediateStageDurationRows[i].setVisible(i < numIntermediateStages);
  }
  this.intermediateStageBeginRows[numIntermediateStages].setVisible(true);
}

module.NStageOscillatingContourPanel_ = function(container, onchange, onstructurechange, nStageOscillatingContour,
                                                 isEnvelope, formatter, steps) {
  module.NStageContourPanel_.call(this, container, onchange, onstructurechange, nStageOscillatingContour, 
                                  isEnvelope, formatter, steps);
  new SettingsUI.ExponentialRangeRow(this, Strings.kSpeed, onchange,
                                     nStageOscillatingContour.oscillationFrequencySetting,
                                     Strings.kFrequencyFormatter, 20);
  new SettingsUI.LinearRangeRow(this, Strings.kAmplitude, onchange,
                                nStageOscillatingContour.oscillationAmountSetting, null, 20);
  new SettingsUI.ExponentialRangeRow(this, Strings.kTimeConstant, onchange,
                                     nStageOscillatingContour.oscillationTimeConstantSetting,
                                     Strings.kSecondsFormatter, 20);
}

module.NStageOscillatingContourPanel_.prototype = Object.create(module.NStageContourPanel_.prototype);

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
    contourGroup.visualizer_.drawContour();
    if (contourGroup.onchange)
      contourGroup.onchange();
  }
  var structureChangeHandler = function() {
    contourGroup.showHideContours_();
    changeHandler();
    if (contourGroup.onsizechange)
      contourGroup.onsizechange();
  }
  new SettingsUI.SelectRow(this.selectPanel_,
                           Strings.kContourType,
                           structureChangeHandler,
                           contouredValue.currentContourSetting,
                           Strings.kContourTypeDescriptions);
  this.flatPanel_ = new module.FlatContourPanel_(
      this.selectPanel_, changeHandler,
      contouredValue.contoursByIdentifier[AudioConstants.kFlatContour],
      contouredValue.isEnvelope, formatter, steps);
  this.oscillatingPanel_ = new module.OscillatingContourPanel_(
      this.selectPanel_, changeHandler, structureChangeHandler,
      contouredValue.contoursByIdentifier[AudioConstants.kOscillatingContour],
      contouredValue.isEnvelope, formatter, steps);
  this.adsrPanel_ = new module.ADSRContourPanel_(
      this.selectPanel_, changeHandler,
      contouredValue.contoursByIdentifier[AudioConstants.kADSRContour],
      contouredValue.isEnvelope, formatter, steps);
  this.nStagePanel_ = new module.NStageContourPanel_(
      this.selectPanel_, changeHandler, structureChangeHandler,
      contouredValue.contoursByIdentifier[AudioConstants.kNStageContour],
      contouredValue.isEnvelope, formatter, steps);
  this.nStageOscillatingPanel_ = new module.NStageOscillatingContourPanel_(
      this.selectPanel_, changeHandler, structureChangeHandler,
      contouredValue.contoursByIdentifier[AudioConstants.kNStageOscillatingContour],
      contouredValue.isEnvelope, formatter, steps);
  if (!contouredValue.isEnvelope) {
    this.sweepPanel_ = new module.SweepContourPanel_(
        this.selectPanel_, changeHandler,
        contouredValue.contoursByIdentifier[AudioConstants.kSweepContour],
        contouredValue.isEnvelope, formatter, steps);
  }

  this.showHideContours_();
  this.setSelected(selected);
}

module.ContourPanel.prototype = Object.create(UI.Panel.prototype);

module.ContourPanel.prototype.showHideContours_ = function() {
  var current = this.contouredValue_.currentContourSetting.value
  this.flatPanel_.setVisible(current == AudioConstants.kFlatContour);
  this.oscillatingPanel_.setVisible(current == AudioConstants.kOscillatingContour);
  this.adsrPanel_.setVisible(current == AudioConstants.kADSRContour);
  this.nStagePanel_.setVisible(current == AudioConstants.kNStageContour);
  this.nStageOscillatingPanel_.setVisible(current == AudioConstants.kNStageOscillatingContour);
  if (this.sweepPanel_)
    this.sweepPanel_.setVisible(current == AudioConstants.kSweepContour);
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

module.ContourPanel.prototype.updateDisplay = function() {
  UI.Panel.prototype.updateDisplay.call(this);
  this.drawContour();
  this.showHideContours_();
}

return module;

})();