Value = (function() {

"use strict";
var module = {};

var kControllerDef = {title: 'Type', indent: 0, min: 0, max: 1, steps: 100, prefix: '', suffix:''};

module.ChoiceValue = function(value, choices) {
  this.value = value;
  this.choices = choices;
}

module.BoolValue = function(value) {
  this.value = value;
}

module.NumberValue = function(value, min, max) {
  this.value = value;
  this.min = min;
  this.max = max;
}

module.ExponentialValue = function(value, base, minExponent, maxExponent) {
  this.value = value;
  this.base = base;
  this.minExponent = minExponent;
  this.maxExponent = maxExponent;
}

return module;

})();
