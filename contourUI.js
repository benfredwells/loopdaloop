ContourUI = (function() {

"use strict";
var module = {};

var kTypeCaptions = ['Flat', 'Oscillating'];
var kTypeValues = [Contour.kFlatContour, Contour.kOscillatingContour];

var kTypeRowDef = {captions: kTypeCaptions, values: kTypeValues};

// contourControllerDef is {title, indent, textSuffix, min, max, steps, prefix, suffix}
// indent can be 0 or 1
module.ContourController = function(group, controllerDef, contour) {
  this.contour_ = contour;
  this.rowDef_ = controllerDef;
  this.group_ = group;

  var typeIndent, controlIndent;
  if (controllerDef.indent == 0) {
    typeIndent = function(row) {return row};
    controlIndent = SettingsUI.makeSubRow;
  } else {
    typeIndent = SettingsUI.makeSubRow;
    controlIndent = SettingsUI.makeSubSubRow;
  }

  var typeRowDef = kTypeRowDef;
  typeRowDef.title = controllerDef.title;
  this.typeRow_ = typeIndent(group.addSelectRow(typeRowDef));
  this.allRows_ = [];
  this.addFlatControls_(controlIndent);
  this.addOscillatingControls_(controlIndent);

  var controller = this;
  var changeHandler = function() {
    controller.contour_.currentContourIdentifier = controller.typeRow_.value();
    controller.showHideControls_();
    if (controller.onchange)
      controller.onchange();
  }

  this.typeRow_.onchange = changeHandler;

  this.enableDisable = function(value) {
    controller.typeRow_.enableDisable(value);
    controller.enableDisableFlatControls_(value);
  }
}

module.ContourController.prototype.showHideControls_ = function() {
  this.allRows_.forEach(function(row) {
    row.hidden = true;
  })
  console.log('id is ' + this.contour_.currentContourIdentifier);
  if (this.contour_.currentContourIdentifier == Contour.kFlatContour) {
    console.log('now here');
    this.showFlatControls_();
  }
}

module.ContourController.prototype.labelString_ = function(value) {
  return this.rowDef_.prefix + SettingsUI.roundForDisplay(value) + this.rowDef_.suffix;
}

module.ContourController.prototype.addFlatControls_ = function(indent) {
  var valueRowDef = this.rowDef_;
  valueRowDef.title = 'Value';
  this.flatValueRow_ = indent(this.group_.addLinearRangeRow(valueRowDef));
  this.allRows_.push(this.flatValueRow);

  var controller = this;
  var flatContour = this.contour_.contoursByIdentifier[Contour.kFlatContour];

  var updateDisplay = function () {
    controller.flatValueRow_.setLabel(controller.labelString_(controller.flatValueRow_.value()));
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

module.ContourController.prototype.showFlatControls_ = function() {
  this.flatValueRow_.hidden = false;
}

module.ContourController.prototype.enableDisableFlatControls_ = function(value) {
  this.flatValueRow_.enableDisable(value);
}

module.ContourController.prototype.addOscillatingControls_ = function() {

}

/*  var freqRowDef = {title: 'Speed', base: 10, minExponent: -1, maxExponent: 1, steps: 20};
  var gainRowDef = {title: 'Amplitude', base: 10, minExponent: -2, maxExponent: 0, steps: 10};

  lfoController.enabledRow = enableIndent(this.addCheckRow({title: lfoControllerDef.title}));
  lfoController.frequencyRow = controlIndent(this.addExponentialRangeRow(lfoController.freqRowDef));
  lfoController.gainRow = controlIndent(this.addExponentialRangeRow(lfoController.gainRowDef));

  var changeHandler = function() {
    lfo.enabled = lfoController.enabledRow.value();
    lfo.frequency = lfoController.frequencyRow.value();
    lfo.gain = lfoController.gainRow.value();
    if (lfoController.onchange)
      lfoController.onchange();
  }

  lfoController.enabledRow.onchange = changeHandler;
  lfoController.frequencyRow.onchange = changeHandler;
  lfoController.gainRow.onchange = changeHandler;
  lfoController.changeHandler = changeHandler;

  lfoController.updateDisplay = function () {
    var r = SettingsUI.roundForDisplay;
    lfoController.frequencyRow.setLabel(r(lfoController.frequencyRow.value()) + ' Hz');
    lfoController.gainRow.setLabel('+- ' + r(lfoController.gainRow.value()));
  }

  lfoController.enableDisable = function(value) {
    lfoController.enabledRow.enableDisable(value);
    var lfoEnabled = value && lfoController.enabledRow.value();
    lfoController.frequencyRow.enableDisable(lfoEnabled);
    lfoController.gainRow.enableDisable(lfoEnabled);
  }

  return controller;
}

*/

return module;

})();


