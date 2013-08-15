ContourUI = (function() {

"use strict";
var module = {};

module.FlatContourGroup_ = function(container, onchange, flatContour, isEnvelope,
                                    formatter, steps) {
  SettingsUI.Group.call(this, container);
  if (!isEnvelope)
    new SettingsUI.LinearRangeRow(this, Strings.kValue, onchange,
                                  flatContour.valueSetting, formatter, steps);
}

module.FlatContourGroup_.prototype = Object.create(SettingsUI.Group.prototype);

module.OscillatingContourGroup_ = function(container, onchange, oscillatingContour,
                                           isEnvelope, formatter, steps) {
  SettingsUI.Group.call(this, container);
  if (!isEnvelope) {
    new SettingsUI.LinearRangeRow(this, Strings.kCenterValue, onchange,
                                  oscillatingContour.centerValueSetting, formatter, steps);
  }
  new SettingsUI.ExponentialRangeRow(this, Strings.kSpeed, onchange,
                                     oscillatingContour.frequencySetting, null, 20);
  new SettingsUI.ExponentialRangeRow(this, Strings.kAmplitude, onchange,
                                     oscillatingContour.amplitudeSetting,
                                     Strings.kMaxFormatter, 10);
}

module.OscillatingContourGroup_.prototype = Object.create(SettingsUI.Group.prototype);

module.ADSRContourGroup_ = function(container, onchange, adsrContour,
                                    isEnvelope, formatter, steps) {
  SettingsUI.Group.call(this, container);

  var contourGroup = this;
  var createValueRow = function(title, setting) {
    new SettingsUI.LinearRangeRow(contourGroup, title, onchange, setting, formatter, steps);
  }
  var createTimeRow = function(title, setting) {
    new SettingsUI.ExponentialRangeRow(contourGroup, title, onchange, setting, Strings.kTimeFormatter, 10);
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

module.ADSRContourGroup_.prototype = Object.create(SettingsUI.Group.prototype);

var kTypeDescriptions = {};
kTypeDescriptions[Contour.kFlatContour] = Strings.kFlat;
kTypeDescriptions[Contour.kOscillatingContour] = Strings.kOscillating;
kTypeDescriptions[Contour.kADSRContour] = Strings.kADSR;

module.ContourGroup = function(container, title, onchange, contouredValue, formatter, steps, selected) {
  SettingsUI.Group.call(this, container);

  this.contouredValue_ = contouredValue;
  this.onchange = onchange;

  this.contourRow_ = new SettingsUI.Row(this, title, null);
  // TODO: rename holderDiv -> div
  this.contourRow_.holderDiv.classList.add('contourGroupRow');

  var controller = this;
  this.contourRow_.holderDiv.onclick = function() {
    controller.setSelected(!controller.selected_);
  }

  this.contourRow_.holderDiv.onmouseenter = function() {
    this.classList.add('hover');
  }

  this.contourRow_.holderDiv.onmouseleave = function() {
    this.classList.remove('hover');
  }

  this.selectGroup_ = new SettingsUI.Group(this);
  this.selectGroup_.holderDiv.classList.add('contourGroup');

  var changeHandler = function() {
    controller.showHideContours_();
    if (controller.onchange)
      controller.onchange();
  }
  new SettingsUI.SelectRow(this.selectGroup_,
                           Strings.kType,
                           changeHandler,
                           contouredValue.currentContourSetting,
                           kTypeDescriptions);
  this.flatGroup_ = new module.FlatContourGroup_(
      this.selectGroup_, onchange,
      contouredValue.contoursByIdentifier[Contour.kFlatContour],
      contouredValue.isEnvelope, formatter, steps);
  this.oscillatingGroup_ = new module.OscillatingContourGroup_(
      this.selectGroup_, onchange,
      contouredValue.contoursByIdentifier[Contour.kOscillatingContour],
      contouredValue.isEnvelope, formatter, steps);
  this.adsrGroup_ = new module.ADSRContourGroup_(
      this.selectGroup_, onchange,
      contouredValue.contoursByIdentifier[Contour.kADSRContour],
      contouredValue.isEnvelope, formatter, steps);

  this.showHideContours_();
  this.setSelected(selected);
}

module.ContourGroup.prototype = Object.create(SettingsUI.Group.prototype);

module.ContourGroup.prototype.showHideContours_ = function() {
  var current = this.contouredValue_.currentContourSetting.value
  this.flatGroup_.setVisible(current == Contour.kFlatContour);
  this.oscillatingGroup_.setVisible(current == Contour.kOscillatingContour);
  this.adsrGroup_.setVisible(current == Contour.kADSRContour);
}

module.ContourGroup.prototype.setSelected = function(selected) {
  this.selected_ = selected;
  if (selected)
    this.contourRow_.holderDiv.classList.add('selected');
  else
    this.contourRow_.holderDiv.classList.remove('selected');
  this.selectGroup_.setVisible(selected);
}

return module;

})();