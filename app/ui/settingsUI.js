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

  var select = document.createElement('select');
  this.controlDiv.appendChild(select);
  for (var i = 0; i < choiceSetting.choices.length; i++) {
    var option = document.createElement('option');
    option.value = choiceSetting.choices[i];
    option.text = descriptions[option.value];
    select.add(option, null);
  }

  var row = this;
  select.onchange = function() {
    choiceSetting.value = select.value;
    if (row.onchange)
      row.onchange();
  }
  select.value = choiceSetting.value;
}

module.SelectRow.prototype = Object.create(module.Row.prototype);

module.CheckRow = function(container, title, onchange, booleanSetting) {
  module.Row.call(this, container, title, onchange);

  var check = document.createElement('input');
  check.type = 'checkbox';
  check.classList.add('setting');
  this.controlDiv.appendChild(check);

  var row = this;
  check.onchange = function() {
    booleanSetting.value = check.checked;
    if (row.onchange)
      row.onchange();
  }

  check.checked = booleanSetting.value;
}

module.CheckRow.prototype = Object.create(module.Row.prototype);

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

  var min = numberSetting.min;
  var max = numberSetting.max;

  var range = document.createElement('input');
  range.type = 'range';
  range.min = 0;
  range.max = steps;
  range.classList.add('setting');
  this.controlDiv.appendChild(range);

  var factor = (max - min) / steps;

  var row = this;
  range.onchange = function() {
    numberSetting.value = min + range.value * factor;
    row.updateLabel();
    if (row.onchange)
      row.onchange();
  }
  range.value = Math.round((numberSetting.value - min) / factor);
  this.updateLabel();
}

module.LinearRangeRow.prototype = Object.create(module.NumberRow.prototype);

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
  this.setValue_(numberSetting.value);
  this.updateLabel();

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

return module;

})();
