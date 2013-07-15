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

module.Number = function(value, min, max) {
  this.value = value;
  this.min = min;
  this.max = max;
}

return module;

})();
