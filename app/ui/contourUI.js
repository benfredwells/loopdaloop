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

////////////////////////////////////////////////////////////////////////////////
// ContourController class, ADSR contour code
module.ADSRGroup_ = function() {
  var controller = this;
  var createTimeRow = function(title, setting) {
    return controller.group_.addExponentialRangeRow(title, setting, controller.contourChangeHandler, 10);
  }
  var adsrRows = [];
  var adsrContour = this.contouredValue_.contoursByIdentifier[Contour.kADSRContour];
  if (!this.contouredValue_.isEnvelope) {
    this.addRow_(this.createValueRow_('Initial Value', adsrContour.initialValueSetting), adsrRows);
    this.addRow_(createTimeRow('Attack Delay', adsrContour.attackDelaySetting), adsrRows);
  }
  this.addRow_(createTimeRow('Attack Time', adsrContour.attackTimeSetting), adsrRows);
  if (!this.contouredValue_.isEnvelope) {
    this.addRow_(this.createValueRow_('Attack Value', adsrContour.attackValueSetting), adsrRows);
  }
  this.addRow_(createTimeRow('Attack Hold', adsrContour.attackHoldSetting), adsrRows);
  this.addRow_(createTimeRow('Decay Time', adsrContour.decayTimeSetting), adsrRows);
  this.addRow_(this.createValueRow_('Sustain Value', adsrContour.sustainValueSetting), adsrRows);
  this.addRow_(createTimeRow('Sustain Hold', adsrContour.sustainHoldSetting), adsrRows);
  this.addRow_(createTimeRow('Release Time', adsrContour.releaseTimeSetting), adsrRows);
  if (!this.contouredValue_.isEnvelope) {
    this.addRow_(this.createValueRow_('Final Value', adsrContour.finalValueSetting), adsrRows);
  }
  this.rowsByContour_[Contour.kADSRContour] = adsrRows;
}

var kTypeDescriptions = {};
kTypeDescriptions[Contour.kFlatContour] = Strings.kFlat;
kTypeDescriptions[Contour.kOscillatingContour] = Strings.kOscillating;
kTypeDescriptions[Contour.kADSRContour] = Strings.kADSR;

module.ContourGroup = function(container, title, onchange, contouredValue, formatter, steps) {
  SettingsUI.Group.call(this, container);

  this.contouredValue_ = contouredValue;
  this.onchange = onchange;

  var controller = this;
  var changeHandler = function() {
    controller.showHideContours_();
    if (controller.onchange)
      controller.onchange();
  }
  new SettingsUI.SelectRow(this,
                           Strings.kType,
                           changeHandler,
                           contouredValue.currentContourSetting,
                           kTypeDescriptions);
  this.flatGroup_ = new module.FlatContourGroup_(
      this, onchange, contouredValue.contoursByIdentifier[Contour.kFlatContour],
      contouredValue.isEnvelope, formatter, steps);
  this.oscillatingGroup_ = new module.OscillatingContourGroup_(
      this, onchange, contouredValue.contoursByIdentifier[Contour.kOscillatingContour],
      contouredValue.isEnvelope, formatter, steps);
}

module.ContourGroup.prototype = Object.create(SettingsUI.Group.prototype);

module.ContourGroup.prototype.showHideContours_ = function() {
  var current = this.contouredValue_.currentContourSetting.value
  this.flatGroup_.setVisible(current == Contour.kFlatContour);
  this.oscillatingGroup_.setVisible(current == Contour.kOscillatingContour);
}

return module;

})();