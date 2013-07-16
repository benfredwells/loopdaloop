ContourUI = (function() {

"use strict";
var module = {};

var kTypeDescriptions = {};
kTypeDescriptions[Contour.kFlatContour] = Strings.kFlat;
kTypeDescriptions[Contour.kOscillatingContour] = Strings.kOscillating;
kTypeDescriptions[Contour.kADSRContour] = Strings.kADSR;

////////////////////////////////////////////////////////////////////////////////
// ContourController class, generic code
module.ContourController = function(group, title, indent, contouredValue, steps, formatter) {
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

  this.typeRow_ = typeIndent(group.addSelectRow(title,
                                                contouredValue.currentContourSetting,
                                                kTypeDescriptions));
  this.allRows_ = [];
  this.rowsByContour_ = {};

  var controller = this;
  this.contourChangeHandler = function() {
    if (controller.onchange)
      controller.onchange();
  }
  this.addFlatControls_(controlIndent);
  this.addOscillatingControls_(controlIndent);
  this.addADSRControls_(controlIndent);

  var changeHandler = function() {
    controller.showHideControls_();
    if (controller.onchange)
      controller.onchange();
  }
  changeHandler();

  this.typeRow_.onchange = changeHandler;

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

module.ContourController.prototype.addValueRow = function(title, valueSetting, indent) {
  return indent(this.group_.addLinearRangeRow(title, valueSetting, this.steps_, this.formatter));
}

////////////////////////////////////////////////////////////////////////////////
// ContourController class, flat contour code
module.ContourController.prototype.addFlatControls_ = function(indent) {
  var flatContour = this.contouredValue_.contoursByIdentifier[Contour.kFlatContour];

  this.flatValueRow_ = this.addValueRow('Value', flatContour.valueSetting, indent);
  this.allRows_.push(this.flatValueRow_);
  this.rowsByContour_[Contour.kFlatContour] = [this.flatValueRow_];

  this.flatValueRow_.onchange = this.contourChangeHandler;
}

////////////////////////////////////////////////////////////////////////////////
// ContourController class, oscillating contour code
module.ContourController.prototype.addOscillatingControls_ = function(indent) {
  var oscillatingContour = this.contouredValue_.contoursByIdentifier[Contour.kOscillatingContour];
  this.oscillatingCenterValueRow_ = this.addValueRow('Center Value',
                                                     oscillatingContour.centerValueSetting,
                                                     indent);
  this.oscillatingFrequencyRow_ = indent(this.group_.addExponentialRangeRow(Strings.kSpeed,
                                                                            oscillatingContour.frequencySetting,
                                                                            20));
  this.oscillatingAmplitudeRow_ = indent(this.group_.addExponentialRangeRow(Strings.kAmplitude,
                                                                            oscillatingContour.amplitudeSetting,
                                                                            10,
                                                                            Strings.kMaxFormatter));
  var oscillatingRows = [];
  oscillatingRows.push(this.oscillatingCenterValueRow_);
  oscillatingRows.push(this.oscillatingFrequencyRow_);
  oscillatingRows.push(this.oscillatingAmplitudeRow_);
  this.rowsByContour_[Contour.kOscillatingContour] = oscillatingRows;

  var controller = this;
  oscillatingRows.forEach(function(row) {
    row.onchange = controller.contourChangeHandler;
    controller.allRows_.push(row);
  });
}

////////////////////////////////////////////////////////////////////////////////
// ContourController class, ADSR contour code
module.ContourController.prototype.addADSRControls_ = function(indent) {
  var addTimeRow = function(title, setting) {
    return indent(controller.group_.addExponentialRangeRow(title, setting, 10));
  }

  var controller = this;
  var adsrContour = this.contouredValue_.contoursByIdentifier[Contour.kADSRContour];
  this.adsrInitialValueRow_ = this.addValueRow('Initial Value', adsrContour.initialValueSetting, indent);
  this.adsrAttackDelayRow_ = addTimeRow('Attack Delay', adsrContour.attackDelaySetting);
  this.adsrAttackTimeRow_ = addTimeRow('Attack Time', adsrContour.attackTimeSetting);
  this.adsrAttackValueRow_ = this.addValueRow('Attack Value', adsrContour.attackValueSetting, indent);
  this.adsrAttackHoldRow_ = addTimeRow('Attack Hold', adsrContour.attackHoldSetting);
  this.adsrDecayTimeRow_ = addTimeRow('Decay Time', adsrContour.decayTimeSetting);
  this.adsrSustainValueRow_ = this.addValueRow('Sustain Value', adsrContour.sustainValueSetting, indent);
  this.adsrSustainHoldRow_ = addTimeRow('Sustain Hold', adsrContour.sustainHoldSetting);
  this.adsrReleaseTimeRow_ = addTimeRow('Release Time', adsrContour.releaseTimeSetting);
  this.adsrFinalValueRow_ = this.addValueRow('Final Value', adsrContour.finalValueSetting, indent);
  var adsrRows = [];
  adsrRows.push(this.adsrInitialValueRow_);
  adsrRows.push(this.adsrAttackDelayRow_);
  adsrRows.push(this.adsrAttackTimeRow_);
  adsrRows.push(this.adsrAttackValueRow_);
  adsrRows.push(this.adsrAttackHoldRow_);
  adsrRows.push(this.adsrDecayTimeRow_);
  adsrRows.push(this.adsrSustainValueRow_);
  adsrRows.push(this.adsrSustainHoldRow_);
  adsrRows.push(this.adsrReleaseTimeRow_);
  adsrRows.push(this.adsrFinalValueRow_);
  this.rowsByContour_[Contour.kADSRContour] = adsrRows;

  var controller = this;
  adsrRows.forEach(function(row) {
    row.onchange = controller.contourChangeHandler;
    controller.allRows_.push(row);
  })
}

return module;

})();


