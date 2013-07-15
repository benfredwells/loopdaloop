SettingsUI = (function() {

"use strict";
var module = {};

module.kDisplayBounds = {};
module.kDisplayBounds.x = 201;
module.kDisplayBounds.y = 51;

module.kDisplayMid = {};
module.kDisplayMid.x = 100.5;
module.kDisplayMid.y = 25.5;

//TODO: make this private to the module. 
module.roundForDisplay = function(number) {
  return Math.round(number * 100) / 100;
}

module.Group = function(categoryParentEl, detailsParentEl, title, owner, collapsed) {
  this.categoryEl_ = document.createElement('div');
  this.categoryEl_.classList.add('instrCategory');
  categoryParentEl.appendChild(this.categoryEl_);
  owner.categoryEl = this.categoryEl_;

  this.heading_ = document.createElement('div');
  this.heading_.classList.add('instrCategoryHeading');
  this.categoryEl_.appendChild(this.heading_);

  var headingText = document.createElement('div');
  headingText.classList.add('instrCategoryHeadingText');
  headingText.innerHTML = title;
  this.heading_.appendChild(headingText);

  this.display_ = document.createElement('div');
  this.display_.classList.add('instrDisplay');
  this.heading_.appendChild(this.display_);

  this.svgDoc = document;
  this.svg = SVGUtils.createSVG(this.svgDoc, this.display_);

  this.detailsEl_ = document.createElement('div');
  this.detailsEl_.classList.add('instrDetails');
  this.detailsEl_.hidden = collapsed;
  detailsParentEl.appendChild(this.detailsEl_);
  owner.detailsEl = this.detailsEl_;

  var ui = this;
  this.heading_.onclick = function() {
    if (!owner.isCollapsed())
      return;
    ui.detailsEl_.hidden = false;
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
  row.label_.classList.add('instrSubDetailDescr');
  return row;
}

module.makeSubSubRow = function(row) {
  row.label_.classList.add('instrSubSubDetailDescr');
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
  row.classList.add('instrDetailRow');
  this.detailsEl_.appendChild(row);

  row.label_ = document.createElement('div');
  row.label_.classList.add('instrDetailDescr');
  row.label_.innerHTML = title;
  row.appendChild(row.label_);

  row.setting_ = document.createElement('div');
  row.setting_.classList.add('instrDetail');
  row.appendChild(row.setting_);

  row.enableDisableDiv_ = function(div, value) {
    if (value)
      div.classList.remove('instrDetailDisabled');
    else
      div.classList.add('instrDetailDisabled');
  }

  row.enableDisable = function(value) {
    row.enableDisableDiv_(row.label_, value);
  }

  return row;
}

module.Group.prototype.addValueLabel_ = function(row) {
  row.valueLabel_ = document.createElement('div');
  row.valueLabel_.classList.add('instrDetailValue');
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

module.Group.prototype.addSelectRow = function(title, choiceSetting, descriptions) {
  var row = this.makeRow_(title);

  row.select = document.createElement('select');
  row.setting_.appendChild(row.select);
  for (var i = 0; i < choiceSetting.choices.length; i++) {
    var option = document.createElement('option');
    option.value = choiceSetting.choices[i];
    option.text = descriptions[option.value];
    row.select.add(option, null);
  }

  var prevEnableDisable = row.enableDisable;
  row.enableDisable = function(value) {
    prevEnableDisable(value);
    row.select.disabled = !value;
  }

  row.select.onchange = function() {
    choiceSetting.value = row.select.value;
    if (row.onchange)
      row.onchange();
  }
  row.select.value = choiceSetting.value;

  return row;
}

module.Group.prototype.addCheckRow = function(title, booleanSetting) {
  var row = this.makeRow_(title);

  row.check = document.createElement('input');
  row.check.type = 'checkbox';
  row.check.classList.add('instrDetail');
  row.setting_.appendChild(row.check);

  var prevEnableDisable = row.enableDisable;
  row.enableDisable = function(value) {
    prevEnableDisable(value);
    row.check.disabled = !value;
  }

  row.check.onchange = function() {
    booleanSetting.value = row.check.checked;
    if (row.onchange)
      row.onchange();
  }

  row.check.checked = booleanSetting.value;
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
  row.range.classList.add('instrDetail');
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

module.Group.prototype.addExponentialRangeRow = function(title, numberSetting, steps, formatter) {
  var base = 10;
  var constant = (numberSetting.max - numberSetting.min) / base;
  var minExponent = -1;
  var maxExponent = 1;
  var row = this.makeRow_(title);

  var range = document.createElement('input');
  range.type = 'range';
  range.min = 0;
  range.max = steps + 1; // add one for the minimum value
  range.classList.add('instrDetail');
  row.setting_.appendChild(range);

  this.addValueLabel_(row);

  var prevEnableDisable = row.enableDisable;
  row.enableDisable = function(value) {
    prevEnableDisable(value);
    range.disabled = !value;
  }

  var exponentFactor = (maxExponent - minExponent) / steps;
  var value = function() {
    var exponent = range.value;
    if (exponent == 0)
      return numberSetting.min;
    exponent--;
    exponent = minExponent + exponent * exponentFactor;
    return numberSetting.min + constant * Math.pow(base, exponent);
  }

  var setValue = function(newValue) {
    if (newValue == numberSetting.min) {
      range.value = 0;
      return;
    }
    var exponent = (newValue - numberSetting.min) / constant;
    var index = Math.log(exponent) / Math.log(base);
    var index = Math.round((index - minExponent) / exponentFactor) + 1;
    range.value = index;
  }

  var setLabel = function() {
    var label = module.roundForDisplay(numberSetting.value);
    if (formatter)
      label = formatter.format(label);
    row.setLabel(label);
  }

  range.onchange = function() {
    numberSetting.value = value();
    setLabel();
    if (row.onchange)
      row.onchange();
  }
  setValue(numberSetting.value);
  setLabel();

  return row;
}

return module;

})();
