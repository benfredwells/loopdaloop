Setting = (function() {

"use strict";
var module = {};

module.Choice = function(choices) {
  this.value = choices[0];
  this.choices = choices;
}

module.Boolean = function() {
  this.value = false;
}

module.Number = function(min, max) {
  this.value = min;
  this.min = min;
  this.max = max;
}

module.copyNumber = function(other) {
  var number = new module.Number(other.min, other.max);
  number.value = other.value;
}

return module;

})();
