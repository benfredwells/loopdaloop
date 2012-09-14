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

module.Group = function(parent, title) {
  this.heading_ = document.createElement('div');
  this.heading_.classList.add('instrSettingHeading');
  parent.appendChild(this.heading_);

  var headingText = document.createElement('div');
  headingText.classList.add('instrSettingHeadingText');
  headingText.innerHTML = title;
  this.heading_.appendChild(headingText);

  this.display_ = document.createElement('div');
  this.display_.classList.add('instrDisplay');
  this.heading_.appendChild(this.display_);

  this.svgDoc = document;
  this.svg = SVGUtils.createSVG(this.svgDoc, this.display_);

  this.details_ = document.createElement('div');
  this.details_.classList.add('instrSettingDetails');
  parent.appendChild(this.details_);
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
  this.details_.appendChild(row);

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

module.Group.prototype.addSelectRow = function(title, array) {
  var row = this.makeRow_(title);

  row.select = document.createElement('select');
  row.setting_.appendChild(row.select);
  for (var i = 0; i < array.length; i++) {
    var option = document.createElement('option');
    option.value = i;
    option.text = array[i];
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

module.Group.prototype.addCheckRow = function(title) {
  var row = this.makeRow_(title);

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

  return row;
}

module.Group.prototype.addLinearRangeRow = function(title, min, max, steps) {
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

  return row;
}

module.Group.prototype.addExponentialRangeRow = function(title, base, minExponent, maxExponent, steps) {
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

  return row;
}

module.makeSubRow = function(row) {
  row.label_.classList.add('instrSubSettingDescr');
  return row;
}

module.makeSubSubRow = function(row) {
  row.label_.classList.add('instrSubSubSettingDescr');
  return row;
}

return module;

})();
