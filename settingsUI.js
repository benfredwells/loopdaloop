SettingsUI = (function() {

"use strict";
var module = {};

module.kDisplayBounds = {};
module.kDisplayBounds.x = 201;
module.kDisplayBounds.y = 51;

module.kDisplayMid = {};
module.kDisplayMid.x = 100.5;
module.kDisplayMid.y = 25.5;

module.roundForDisplay = function(number) {
  return Math.round(number * 100) / 100;
}

module.Group = function(categoryParentEl, detailsParentEl, title, owner, collapsed) {
  this.categoryEl_ = document.createElement('div');
  this.categoryEl_.classList.add('instrSettingGroup');
  categoryParentEl.appendChild(this.categoryEl_);
  owner.categoryEl = this.categoryEl_;

  this.heading_ = document.createElement('div');
  this.heading_.classList.add('instrSettingHeading');
  this.categoryEl_.appendChild(this.heading_);

  var headingText = document.createElement('div');
  headingText.classList.add('instrSettingHeadingText');
  headingText.innerHTML = title;
  this.heading_.appendChild(headingText);

  this.display_ = document.createElement('div');
  this.display_.classList.add('instrDisplay');
  this.heading_.appendChild(this.display_);

  this.svgDoc = document;
  this.svg = SVGUtils.createSVG(this.svgDoc, this.display_);

  this.detailsEl_ = document.createElement('div');
  this.detailsEl_.classList.add('instrSettingDetails');
  this.detailsEl_.hidden = collapsed;
  detailsParentEl.appendChild(this.detailsEl_);
  owner.detailsEl = this.detailsEl_;

  var ui = this;
  this.heading_.onclick = function() {
    ui.detailsEl_.hidden = !ui.detailsEl_.hidden;
    if (owner.onCollapseChanged)
      owner.onCollapseChanged(owner);
  }

  owner.setCollapsed = function(collapsed) {
    ui.detailsEl_.hidden = collapsed;
  }
  
  owner.isCollapsed = function() {
    return ui.detailsEl_.hidden;
  }
}

module.makeSubRow = function(row) {
  row.label_.classList.add('instrSubSettingDescr');
  return row;
}

module.makeSubSubRow = function(row) {
  row.label_.classList.add('instrSubSubSettingDescr');
  return row;
}

function setupOnchange(row, element) {
  element.onchange = function() {
    if (row.onchange)
      row.onchange();
  }
}

module.Group.prototype.makeRow_ = function(title) {
  var row = document.createElement('div');
  row.classList.add('instrSettingRow');
  this.detailsEl_.appendChild(row);

  row.label_ = document.createElement('div');
  row.label_.classList.add('instrSettingDescr');
  row.label_.innerHTML = title;
  row.appendChild(row.label_);

  row.setting_ = document.createElement('div');
  row.setting_.classList.add('instrSetting');
  row.appendChild(row.setting_);

  row.enableDisableDiv_ = function(div, value) {
    if (value)
      div.classList.remove('instrSettingDisabled');
    else
      div.classList.add('instrSettingDisabled');
  }

  row.enableDisable = function(value) {
    row.enableDisableDiv_(row.label_, value);
  }

  return row;
}

module.Group.prototype.addValueLabel_ = function(row) {
  row.valueLabel_ = document.createElement('div');
  row.valueLabel_.classList.add('instrSettingValue');
  row.appendChild(row.valueLabel_);

  row.setLabel = function(newText) {
    row.valueLabel_.innerHTML = newText;
  }

  var prevEnableDisable = row.enableDisable;
  row.enableDisable = function(value) {
    prevEnableDisable(value);
    row.enableDisableDiv_(row.valueLabel_, value);
  }
}

// selectRowDef is {title, array}
module.Group.prototype.addSelectRow = function(selectRowDef) {
  var row = this.makeRow_(selectRowDef.title);

  row.select = document.createElement('select');
  row.setting_.appendChild(row.select);
  for (var i = 0; i < selectRowDef.captions.length; i++) {
    var option = document.createElement('option');
    option.value = selectRowDef.values[i];
    option.text = selectRowDef.captions[i];
    row.select.add(option, null);
  }

  row.value = function() {
    return row.select.value;
  }

  row.setValue = function(newValue) {
    row.select.value = newValue;
  }

  var prevEnableDisable = row.enableDisable;
  row.enableDisable = function(value) {
    prevEnableDisable(value);
    row.select.disabled = !value;
  }

  setupOnchange(row, row.select);

  return row;
}

// checkRowDef is {title}
module.Group.prototype.addCheckRow = function(checkRowDef) {
  var row = this.makeRow_(checkRowDef.title);

  row.check = document.createElement('input');
  row.check.type = 'checkbox';
  row.check.classList.add('instrSetting');
  row.setting_.appendChild(row.check);

  row.value = function() {
    return row.check.checked;
  }

  row.setValue = function(newValue) {
    row.check.checked = newValue;
  }

  var prevEnableDisable = row.enableDisable;
  row.enableDisable = function(value) {
    prevEnableDisable(value);
    row.check.disabled = !value;
  }

  setupOnchange(row, row.check);

  return row;
}

// linearRangeDef is {title, min, max, steps}
module.Group.prototype.addLinearRangeRow = function(linearRangeDef) {
  var title = linearRangeDef.title;
  var min = linearRangeDef.min;
  var max = linearRangeDef.max;
  var steps = linearRangeDef.steps;

  var row = this.makeRow_(title);

  row.range = document.createElement('input');
  row.range.type = 'range';
  row.range.min = 0;
  row.range.max = steps;
  row.range.classList.add('instrSetting');
  row.setting_.appendChild(row.range);

  this.addValueLabel_(row);

  var factor = (max - min) / steps;
  row.value = function() {
    var rangeVal = row.range.value;
    return min + rangeVal * factor;
  }

  row.setValue = function(newValue) {
    var rangeVal = Math.round((newValue - min) / factor);
    row.range.value = rangeVal;
  }

  var prevEnableDisable = row.enableDisable;
  row.enableDisable = function(value) {
    prevEnableDisable(value);
    row.range.disabled = !value;
  }

  setupOnchange(row, row.range);

  return row;
}

// exponentialRangeDef is {title, base, minExponent, maxExponent, steps}
module.Group.prototype.addExponentialRangeRow = function(exponentialRangeDef) {
  var title = exponentialRangeDef.title;
  var base = exponentialRangeDef.base;
  var minExponent = exponentialRangeDef.minExponent;
  var maxExponent = exponentialRangeDef.maxExponent;
  var steps = exponentialRangeDef.steps;

  var row = this.makeRow_(title);

  row.range = document.createElement('input');
  row.range.type = 'range';
  row.range.min = 0;
  row.range.max = steps;
  row.range.classList.add('instrSetting');
  row.setting_.appendChild(row.range);

  this.addValueLabel_(row);

  var exponentFactor = (maxExponent - minExponent) / steps;
  row.value = function() {
    var exponent = row.range.value;
    exponent = minExponent + exponent * exponentFactor;
    return Math.pow(base, exponent);
  }

  row.setValue = function(newValue) {
    var exponent = Math.log(newValue) / Math.log(base);
    var rangeVal = Math.round((exponent - minExponent) / exponentFactor);
    row.range.value = rangeVal;
  }

  var prevEnableDisable = row.enableDisable;
  row.enableDisable = function(value) {
    prevEnableDisable(value);
    row.range.disabled = !value;
  }

  setupOnchange(row, row.range);

  return row;
}

// lfoControllerDef is {title, indent}
// indent can be 0 or 1
module.Group.prototype.addLFOController = function(lfoControllerDef, lfo) {
  var lfoController = {};
  lfoController.freqRowDef = {title: 'Speed', base: 10, minExponent: -1, maxExponent: 1, steps: 20};
  lfoController.gainRowDef = {title: 'Amplitude', base: 10, minExponent: -2, maxExponent: 0, steps: 10};
  lfoController.phaseRowDef = {title: 'Phase', min: -180, max: 180, steps: 36};

  var enableIndent, controlIndent;
  if (lfoControllerDef.indent == 0) {
    enableIndent = function(row) {return row};
    controlIndent = module.makeSubRow;
  } else {
    enableIndent = module.makeSubRow;
    controlIndent = module.makeSubSubRow;
  }

  lfoController.enabledRow = enableIndent(this.addCheckRow({title: lfoControllerDef.title}));
  lfoController.frequencyRow = controlIndent(this.addExponentialRangeRow(lfoController.freqRowDef));
  lfoController.gainRow = controlIndent(this.addExponentialRangeRow(lfoController.gainRowDef));
  lfoController.phaseRow = controlIndent(this.addLinearRangeRow(lfoController.phaseRowDef));

  var changeHandler = function() {
    lfo.enabled = lfoController.enabledRow.value();
    lfo.frequency = lfoController.frequencyRow.value();
    lfo.phase = 2 * Math.PI * lfoController.phaseRow.value() / 360;
    lfo.gain = lfoController.gainRow.value();
    if (lfoController.onchange)
      lfoController.onchange();
  }

  lfoController.enabledRow.onchange = changeHandler;
  lfoController.frequencyRow.onchange = changeHandler;
  lfoController.gainRow.onchange = changeHandler;
  lfoController.phaseRow.onchange = changeHandler;
  lfoController.changeHandler = changeHandler;

  lfoController.updateDisplay = function () {
    var r = SettingsUI.roundForDisplay;
    lfoController.frequencyRow.setLabel(r(lfoController.frequencyRow.value()) + ' Hz');
    lfoController.gainRow.setLabel('+- ' + r(lfoController.gainRow.value()));
    lfoController.phaseRow.setLabel(lfoController.phaseRow.value());
  }

  lfoController.enableDisable = function(value) {
    lfoController.enabledRow.enableDisable(value);
    var lfoEnabled = value && lfoController.enabledRow.value();
    lfoController.frequencyRow.enableDisable(lfoEnabled);
    lfoController.gainRow.enableDisable(lfoEnabled);
    lfoController.phaseRow.enableDisable(lfoEnabled);
  }

  return lfoController;
}

function linearValue(value, exponentialRowDef, linearMin, linearMax) {
  var exponent = Math.log(value) / Math.log(exponentialRowDef.base);
  var expMin = exponentialRowDef.minExponent;
  var expMax = exponentialRowDef.maxExponent;
  var factor = (linearMax - linearMin) / (expMax - expMin);
  return (exponent - expMin) * factor + linearMin;
}

function pcntToStr(val) {
  return val.toString() + '%';
}

var kMinVar = 0.05;
var kMinFreqPcnt = 25;  // Min is greater than max, as low frequency maps to
var kMaxFreqPcnt = 2;   // a large period.

module.Group.prototype.defineLFOGradientOrSolid = function(name, lfo, controller, min, max, center, flat) {
  if (this[name])
    this.svg.defs.removeChild(this[name]);
  if (lfo.enabled) {
    var gainPos = linearValue(lfo.gain, controller.gainRowDef, kMinVar, 1);
    var beginInt = center * (1 - gainPos);
    var begin = SVGUtils.interpolateColors(min, max, beginInt);
    var endInt = gainPos - center * (gainPos - 1);
    var end = SVGUtils.interpolateColors(min, max, endInt);
    var frequencyPcnt = linearValue(lfo.frequency, controller.freqRowDef, kMinFreqPcnt, kMaxFreqPcnt);
    var phasePcnt = lfo.phase * frequencyPcnt / Math.PI;
    var gradient = SVGUtils.createLinearGradient(
        name, pcntToStr(phasePcnt), '0%',
        pcntToStr(phasePcnt + frequencyPcnt), '0', 'reflect',
        this.svgDoc, this.svg);
    SVGUtils.addStopToGradient('0', begin, gradient, this.svgDoc);
    SVGUtils.addStopToGradient('1', end, gradient, this.svgDoc);
    this[name] = gradient;
    return 'url(#' + name + ')';
  } else {
    delete this[name];
    return flat;
  }
}

return module;

})();
