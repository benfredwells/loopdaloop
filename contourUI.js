ContourUI = (function() {

"use strict";
var module = {};

var kTypeDescriptions = {};
kTypeDescriptions[Contour.kFlatContour] = Strings.kFlat;
kTypeDescriptions[Contour.kOscillatingContour] = Strings.kOscillating;
kTypeDescriptions[Contour.kADSRContour] = Strings.kADSR;

////////////////////////////////////////////////////////////////////////////////
// ContourController class, generic code
module.ContourController = function(group, title, indent, contouredValue, onchange, steps, formatter) {
  this.contouredValue_ = contouredValue;
  this.group_ = group;
  this.steps_ = steps;
  this.formatter_ = formatter;

  var typeIndent, controlIndent;
  if (indent == 0) {
    typeIndent = function(row) {return row};
    controlIndent = SettingsUI.makeSubRow;
  } else {
    typeIndent = SettingsUI.makeSubRow;
    controlIndent = SettingsUI.makeSubSubRow;
  }

  this.allRows_ = [];
  this.rowsByContour_ = {};

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
  this.typeRow_ = typeIndent(group.addSelectRow(title,
                                                contouredValue.currentContourSetting,
                                                changeHandler,
                                                kTypeDescriptions));
  this.addFlatControls_(controlIndent);
  this.addOscillatingControls_(controlIndent);
  this.addADSRControls_(controlIndent);

  changeHandler();
  // Set this change handler after calling changeHandler to prevent the call
  // bubbling up while the owner may still be initialiing the UI.
  this.onchange = onchange;

  this.enableDisable = function(value) {
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

module.ContourController.prototype.createValueRow_ = function(title, valueSetting, indent) {
  return indent(this.group_.addLinearRangeRow(title,
                                              valueSetting,
                                              this.contourChangeHandler,
                                              this.steps_,
                                              this.formatter));
}

module.ContourController.prototype.addRow_ = function(row, array) {
  array.push(row);
  this.allRows_.push(row);
}

////////////////////////////////////////////////////////////////////////////////
// ContourController class, flat contour code
module.ContourController.prototype.addFlatControls_ = function(indent) {
  var flatRows = [];
  var flatContour = this.contouredValue_.contoursByIdentifier[Contour.kFlatContour];

  this.addRow_(this.createValueRow_('Value', flatContour.valueSetting, indent), flatRows);
  this.rowsByContour_[Contour.kFlatContour] = flatRows;
}

////////////////////////////////////////////////////////////////////////////////
// ContourController class, oscillating contour code
module.ContourController.prototype.addOscillatingControls_ = function(indent) {
  var oscillatingRows = [];
  var oscillatingContour = this.contouredValue_.contoursByIdentifier[Contour.kOscillatingContour];
  this.addRow_(this.createValueRow_('Center Value',
                                    oscillatingContour.centerValueSetting,
                                    indent),
               oscillatingRows);
  this.addRow_(indent(this.group_.addExponentialRangeRow(Strings.kSpeed,
                                                         oscillatingContour.frequencySetting,
                                                         this.contourChangeHandler,
                                                         20)),
               oscillatingRows);
  this.addRow_(indent(this.group_.addExponentialRangeRow(Strings.kAmplitude,
                                                         oscillatingContour.amplitudeSetting,
                                                         this.contourChangeHandler,
                                                         10,
                                                         Strings.kMaxFormatter)),
               oscillatingRows);
  this.rowsByContour_[Contour.kOscillatingContour] = oscillatingRows;
}

////////////////////////////////////////////////////////////////////////////////
// ContourController class, ADSR contour code
module.ContourController.prototype.addADSRControls_ = function(indent) {
  var controller = this;
  var createTimeRow = function(title, setting) {
    return indent(controller.group_.addExponentialRangeRow(title, setting, controller.contourChangeHandler, 10));
  }
  var adsrRows = [];
  var adsrContour = this.contouredValue_.contoursByIdentifier[Contour.kADSRContour];
  this.addRow_(this.createValueRow_('Initial Value', adsrContour.initialValueSetting, indent), adsrRows);
  this.addRow_(createTimeRow('Attack Delay', adsrContour.attackDelaySetting), adsrRows);
  this.addRow_(createTimeRow('Attack Time', adsrContour.attackTimeSetting), adsrRows);
  this.addRow_(this.createValueRow_('Attack Value', adsrContour.attackValueSetting, indent), adsrRows);
  this.addRow_(createTimeRow('Attack Hold', adsrContour.attackHoldSetting), adsrRows);
  this.addRow_(createTimeRow('Decay Time', adsrContour.decayTimeSetting), adsrRows);
  this.addRow_(this.createValueRow_('Sustain Value', adsrContour.sustainValueSetting, indent), adsrRows);
  this.addRow_(createTimeRow('Sustain Hold', adsrContour.sustainHoldSetting), adsrRows);
  this.addRow_(createTimeRow('Release Time', adsrContour.releaseTimeSetting), adsrRows);
  this.addRow_(this.createValueRow_('Final Value', adsrContour.finalValueSetting, indent), adsrRows);
  this.rowsByContour_[Contour.kADSRContour] = adsrRows;
}

return module;

})();


