SettingsUI = (function() {

"use strict";
var module = {};

module.Row = function(container, title, onchange) {
  UI.Control.call(this, container);
  this.div.classList.add('row');

  this.label = document.createElement('div');
  this.label.classList.add('rowName');
  this.label.innerHTML = title;
  this.div.appendChild(this.label);

  this.controlDiv = document.createElement('div');
  this.controlDiv.classList.add('rowControl');
  this.div.appendChild(this.controlDiv);

  this.onchange = onchange;
}

module.Row.prototype = Object.create(UI.Control.prototype);

module.SelectRow = function(container, title, onchange, choiceSetting, descriptions) {
  module.Row.call(this, container, title, onchange);
  this.choiceSetting = choiceSetting;

  this.select = document.createElement('select');
  this.controlDiv.appendChild(this.select);
  for (var i = 0; i < choiceSetting.choices.length; i++) {
    var option = document.createElement('option');
    option.value = choiceSetting.choices[i];
    option.text = descriptions[option.value];
    this.select.add(option, null);
  }

  var row = this;
  this.select.onchange = function() {
    choiceSetting.value = row.select.value;
    if (row.onchange)
      row.onchange();
  }
  this.updateControl();
}

module.SelectRow.prototype = Object.create(module.Row.prototype);

module.SelectRow.prototype.updateControl = function() {
  this.select.value = this.choiceSetting.value;
}

module.CheckRow = function(container, title, onchange, booleanSetting) {
  module.Row.call(this, container, title, onchange);
  this.booleanSetting = booleanSetting;

  this.check = document.createElement('input');
  this.check.type = 'checkbox';
  this.check.classList.add('setting');
  this.controlDiv.appendChild(this.check);

  var row = this;
  this.check.onchange = function() {
    booleanSetting.value = row.check.checked;
    if (row.onchange)
      row.onchange();
  }

  this.updateControl();
}

module.CheckRow.prototype = Object.create(module.Row.prototype);

module.CheckRow.prototype.updateControl = function() {
  this.check.checked = this.booleanSetting.value;
}

function roundForDisplay(number) {
  return Math.round(number * 100) / 100;
}

// formatter can be null
module.NumberRow = function(container, title, onchange, numberSetting, formatter) {
  module.Row.call(this, container, title, onchange);
  this.valueLabel_ = document.createElement('div');
  this.valueLabel_.classList.add('rowValue');
  this.div.appendChild(this.valueLabel_);

  this.formatter_ = formatter;
  this.numberSetting = numberSetting;
}

module.NumberRow.prototype = Object.create(module.Row.prototype);

module.NumberRow.prototype.updateLabel = function() {
  var label = roundForDisplay(this.numberSetting.value);
  if (this.formatter_)
    label = this.formatter_.format(label);
  this.valueLabel_.innerHTML = label;
}

module.LinearRangeRow = function(container, title, onchange, numberSetting, formatter, steps) {
  module.NumberRow.call(this, container, title, onchange, numberSetting, formatter);

  this.min = numberSetting.min;
  this.max = numberSetting.max;

  this.range = document.createElement('input');
  this.range.type = 'range';
  this.range.min = 0;
  this.range.max = steps;
  this.range.classList.add('setting');
  this.controlDiv.appendChild(this.range);

  this.factor = (this.max - this.min) / steps;

  var row = this;
  this.range.onchange = function() {
    numberSetting.value = row.min + row.range.value * row.factor;
    row.updateLabel();
    if (row.onchange)
      row.onchange();
  }

  this.updateControl();
}

module.LinearRangeRow.prototype = Object.create(module.NumberRow.prototype);

module.LinearRangeRow.prototype.updateControl = function() {
  this.range.value = Math.round((this.numberSetting.value - this.min) / this.factor);
  this.updateLabel();
}

module.ExponentialRangeRow = function(container, title, onchange, numberSetting, formatter, steps) {
  module.NumberRow.call(this, container, title, onchange, numberSetting, formatter);

  this.base_ = 10;
  this.constant_ = (numberSetting.max - numberSetting.min) / this.base_;
  this.minExponent_ = -1;
  this.maxExponent_ = 1;
  this.exponentFactor_ = (this.maxExponent_ - this.minExponent_) / steps;

  this.range_ = document.createElement('input');
  this.range_.type = 'range';
  this.range_.min = 0;
  this.range_.max = steps + 1; // add one for the minimum value
  this.range_.classList.add('setting');
  this.controlDiv.appendChild(this.range_);

  var row = this;
  this.range_.onchange = function() {
    numberSetting.value = row.value_();
    row.updateLabel();
    if (row.onchange)
      row.onchange();
  }

  this.updateControl();
}

module.ExponentialRangeRow.prototype = Object.create(module.NumberRow.prototype);

module.ExponentialRangeRow.prototype.value_ = function() {
  var exponent = this.range_.value;
  if (exponent == 0)
    return this.numberSetting.min;
  exponent--;
  exponent = this.minExponent_ + exponent * this.exponentFactor_;
  return this.numberSetting.min + this.constant_ * Math.pow(this.base_, exponent);
}

module.ExponentialRangeRow.prototype.setValue_ = function(newValue) {
  if (newValue == this.numberSetting.min) {
    this.range_.value = 0;
    return;
  }
  var exponent = (newValue - this.numberSetting.min) / this.constant_;
  var index = Math.log(this.exponent_) / Math.log(this.base_);
  var index = Math.round((index - this.minExponent_) / this.exponentFactor_) + 1;
  this.range_.value = index;
}

module.ExponentialRangeRow.prototype.updateControl = function() {
  this.setValue_(this.numberSetting.value);
  this.updateLabel();
}

return module;

})();
