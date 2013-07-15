Setting = (function() {

"use strict";
var module = {};

module.Choice = function(value, choices) {
  this.value = value;
  this.choices = choices;
}

module.Boolean = function(value) {
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
