ContourUI = (function() {

"use strict";
var module = {};

var kTypeDescriptions = {};
kTypeDescriptions[Contour.kFlatContour] = Strings.kFlat;
kTypeDescriptions[Contour.kOscillatingContour] = Strings.kOscillating;
kTypeDescriptions[Contour.kADSRContour] = Strings.kADSR;

////////////////////////////////////////////////////////////////////////////////
// ContourController class, generic code
module.ContourController = function(parentSettings, title, indent, contouredValue, onchange, steps, formatter) {
  this.contouredValue_ = contouredValue;
  this.steps_ = steps;
  this.formatter_ = formatter;

  this.allRows_ = [];
  this.rowsByContour_ = {};

  this.groupRow_ = parentSettings.makeRow(title, null);
  this.groupRow_.classList.add('contourGroupRow');
  this.group_ = new SettingsUI.Group(parentSettings.containerEl, 'contourRow');

  var controller = this;
  this.contourChangeHandler = function() {
    if (controller.onchange)
      controller.onchange();
  }
  var changeHandler = function() {
    controller.showHideControls_();
    if (controller.onchange)
      controller.onchange();
  }
  this.typeRow_ = this.group_.addSelectRow(Strings.kType,
                                           contouredValue.currentContourSetting,
                                           changeHandler,
                                           kTypeDescriptions);
  this.addFlatControls_();
  this.addOscillatingControls_();
  this.addADSRControls_();

  changeHandler();
  // Set this change handler after calling changeHandler to prevent the call
  // bubbling up while the owner may still be initialiing the UI.
  this.onchange = onchange;

  this.enableDisable = function(value) {
    controller.groupRow_.enableDisable(value)
    controller.typeRow_.enableDisable(value);
    controller.allRows_.forEach(function(row) {
      row.enableDisable(value);
    });
  }
}

function showRows(rows) {
  rows.forEach(function(row) {
    row.hidden = false;
  });
}

module.ContourController.prototype.showHideControls_ = function() {
  this.allRows_.forEach(function(row) {
    row.hidden = true;
  });
  showRows(this.rowsByContour_[this.contouredValue_.currentContourSetting.value]);
}

module.ContourController.prototype.createValueRow_ = function(title, valueSetting) {
  return this.group_.addLinearRangeRow(title,
                                       valueSetting,
                                       this.contourChangeHandler,
                                       this.steps_,
                                       this.formatter_);
}

module.ContourController.prototype.addRow_ = function(row, array) {
  array.push(row);
  this.allRows_.push(row);
}

////////////////////////////////////////////////////////////////////////////////
// ContourController class, flat contour code
module.ContourController.prototype.addFlatControls_ = function() {
  var flatRows = [];
  var flatContour = this.contouredValue_.contoursByIdentifier[Contour.kFlatContour];

  if (!this.contouredValue_.isEnvelope)
    this.addRow_(this.createValueRow_('Value', flatContour.valueSetting), flatRows);
  this.rowsByContour_[Contour.kFlatContour] = flatRows;
}

////////////////////////////////////////////////////////////////////////////////
// ContourController class, oscillating contour code
module.ContourController.prototype.addOscillatingControls_ = function() {
  var oscillatingRows = [];
  var oscillatingContour = this.contouredValue_.contoursByIdentifier[Contour.kOscillatingContour];
  if (!this.contouredValue_.isEnvelope) {
    this.addRow_(this.createValueRow_('Center Value',
                                      oscillatingContour.centerValueSetting),
                 oscillatingRows);
  }
  this.addRow_(this.group_.addExponentialRangeRow(Strings.kSpeed,
                                                  oscillatingContour.frequencySetting,
                                                  this.contourChangeHandler,
                                                  20),
               oscillatingRows);
  this.addRow_(this.group_.addExponentialRangeRow(Strings.kAmplitude,
                                                  oscillatingContour.amplitudeSetting,
                                                  this.contourChangeHandler,
                                                  10,
                                                  Strings.kMaxFormatter),
               oscillatingRows);
  this.rowsByContour_[Contour.kOscillatingContour] = oscillatingRows;
}

////////////////////////////////////////////////////////////////////////////////
// ContourController class, ADSR contour code
module.ContourController.prototype.addADSRControls_ = function() {
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

return module;

})();