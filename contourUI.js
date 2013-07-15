ContourUI = (function() {

"use strict";
var module = {};

var kTypeDescriptions = {};
kTypeDescriptions[Contour.kFlatContour] = Strings.kFlat;
kTypeDescriptions[Contour.kOscillatingContour] = Strings.kOscillating;
kTypeDescriptions[Contour.kADSRContour] = Strings.kADSR;

////////////////////////////////////////////////////////////////////////////////
// ContourController class, generic code

// contourControllerDef is {title, indent, min, max, steps, prefix, suffix}
// indent can be 0 or 1
module.ContourController = function(group, controllerDef, contouredValue) {
  this.contouredValue_ = contouredValue;
  this.rowDef_ = {};
  this.rowDef_.min = controllerDef.min;
  this.rowDef_.max = controllerDef.max;
  this.rowDef_.steps = controllerDef.steps;
  this.prefix_ = controllerDef.prefix;
  this.suffix_ = controllerDef.suffix;
  this.group_ = group;

  var typeIndent, controlIndent;
  if (controllerDef.indent == 0) {
    typeIndent = function(row) {return row};
    controlIndent = SettingsUI.makeSubRow;
  } else {
    typeIndent = SettingsUI.makeSubRow;
    controlIndent = SettingsUI.makeSubSubRow;
  }

  this.typeRow_ = typeIndent(group.addSelectRow(controllerDef.title,
                                                contouredValue.currentContourSetting,
                                                kTypeDescriptions));
  this.allRows_ = [];
  this.rowsByContour_ = {};
  this.addFlatControls_(controlIndent);
  this.addOscillatingControls_(controlIndent);
  this.addADSRControls_(controlIndent);

  var controller = this;
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

module.ContourController.prototype.addValueRow = function(title, indent) {
  var newRowDef = this.rowDef_;
  newRowDef.title = title;
  return indent(this.group_.addLinearRangeRow(newRowDef));
}

module.ContourController.prototype.updateValueRow = function(row) {
  var value = row.value();
  row.setLabel(this.prefix_ + SettingsUI.roundForDisplay(value) + this.suffix_);
}

module.ContourController.prototype.updateTimeRow = function(row) {
  row.setLabel(SettingsUI.roundForDisplay(row.value()) + ' s');
}

////////////////////////////////////////////////////////////////////////////////
// ContourController class, flat contour code
module.ContourController.prototype.addFlatControls_ = function(indent) {
  this.flatValueRow_ = this.addValueRow('Value', indent);
  this.allRows_.push(this.flatValueRow_);
  this.rowsByContour_[Contour.kFlatContour] = [this.flatValueRow_];

  var controller = this;
  var flatContour = this.contouredValue_.contoursByIdentifier[Contour.kFlatContour];

  var updateDisplay = function () {
    controller.updateValueRow(controller.flatValueRow_);
  }

  var changeHandler = function() {
    flatContour.value = controller.flatValueRow_.value();
    updateDisplay();
    if (controller.onchange)
      controller.onchange();
  }

  updateDisplay();
  this.flatValueRow_.onchange = changeHandler;
}

////////////////////////////////////////////////////////////////////////////////
// ContourController class, oscillating contour code
module.ContourController.prototype.addOscillatingControls_ = function(indent) {
  var oscillatingContour = this.contouredValue_.contoursByIdentifier[Contour.kOscillatingContour];
  this.oscillatingCenterValueRow_ = this.addValueRow('Center Value', indent);
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

  var updateDisplay = function () {
    controller.updateValueRow(controller.oscillatingCenterValueRow_);
  }

  var changeHandler = function() {
    oscillatingContour.centerValue = controller.oscillatingCenterValueRow_.value();
    updateDisplay();
    if (controller.onchange)
      controller.onchange();
  }

  updateDisplay();
  oscillatingRows.forEach(function(row) {
    row.onchange = changeHandler;
    controller.allRows_.push(row);
  });
}

////////////////////////////////////////////////////////////////////////////////
// ContourController class, ADSR contour code
module.ContourController.prototype.addADSRControls_ = function(indent) {
  var controller = this;
  var addTimeRow = function(title, includeZero) {
    var timeRowDef = {min: 0, max: 10, steps: 100};
    timeRowDef.title = title;
    timeRowDef.includeZero = includeZero;
    return indent(controller.group_.addLinearRangeRow(timeRowDef));
  }
  this.adsrInitialValueRow_ = this.addValueRow('Initial Value', indent);
  this.adsrAttackDelayRow_ = addTimeRow('Attack Delay', true);
  this.adsrAttackTimeRow_ = addTimeRow('Attack Time', false);
  this.adsrAttackValueRow_ = this.addValueRow('Attack Value', indent);
  this.adsrAttackHoldRow_ = addTimeRow('Attack Hold', true);
  this.adsrDecayTimeRow_ = addTimeRow('Decay Time', false);
  this.adsrSustainValueRow_ = this.addValueRow('Sustain Value', indent);
  this.adsrSustainHoldRow_ = addTimeRow('Sustain Hold', true);
  this.adsrReleaseTimeRow_ = addTimeRow('Release Time', false);
  this.adsrFinalValueRow_ = this.addValueRow('Final Value', indent);
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
  var adsrContour = this.contouredValue_.contoursByIdentifier[Contour.kADSRContour];

  var updateDisplay = function () {
    controller.updateValueRow(controller.adsrInitialValueRow_);
    controller.updateTimeRow(controller.adsrAttackDelayRow_);
    controller.updateTimeRow(controller.adsrAttackTimeRow_);
    controller.updateValueRow(controller.adsrAttackValueRow_);
    controller.updateTimeRow(controller.adsrAttackHoldRow_);
    controller.updateTimeRow(controller.adsrDecayTimeRow_);
    controller.updateValueRow(controller.adsrSustainValueRow_);
    controller.updateTimeRow(controller.adsrSustainHoldRow_);
    controller.updateTimeRow(controller.adsrReleaseTimeRow_);
    controller.updateValueRow(controller.adsrFinalValueRow_);
  }

  var changeHandler = function() {
    adsrContour.initialValue = controller.adsrInitialValueRow_.value();
    adsrContour.attackDelay = controller.adsrAttackDelayRow_.value();
    adsrContour.attackTime = controller.adsrAttackTimeRow_.value();
    adsrContour.attackValue = controller.adsrAttackValueRow_.value();
    adsrContour.attackHold = controller.adsrAttackHoldRow_.value();
    adsrContour.decayTime = controller.adsrDecayTimeRow_.value();
    adsrContour.sustainValue = controller.adsrSustainValueRow_.value();
    adsrContour.sustainHold = controller.adsrSustainHoldRow_.value();
    adsrContour.releaseTime = controller.adsrReleaseTimeRow_.value();
    adsrContour.finalValue = controller.adsrFinalValueRow_.value();
    updateDisplay();
    if (controller.onchange)
      controller.onchange();
  }

  updateDisplay();
  adsrRows.forEach(function(row) {
    row.onchange = changeHandler;
    controller.allRows_.push(row);
  })
}

return module;

})();


