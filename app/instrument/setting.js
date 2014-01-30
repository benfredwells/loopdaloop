Setting = (function() {

"use strict";
var module = {};

var Setting = function() {
	this.value = null;
}

Setting.prototype.setValue = function(aValue) {
  value = aValue;
}

module.Choice = function(choices) {
  Setting.call(this);
  this.value = choices[0];
  this.choices = choices;
}

module.Choice.prototype = Object.create(Setting.prototype);

module.Boolean = function() {
  Setting.call(this);
  this.value = false;
}

module.Boolean.prototype = Object.create(Setting.prototype);

module.Number = function(min, max) {
  Setting.call(this);
  this.value = min;
  this.min = min;
  this.max = max;
}

module.Number.prototype = Object.create(Setting.prototype);

module.copyNumber = function(other) {
  Setting.call(this);
  var number = new module.Number(other.min, other.max);
  number.value = other.value;
  return number;
}

return module;

})();
