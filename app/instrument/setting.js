Setting = (function() {

"use strict";
var module = {};


// listener needs to implement onModifiedChanged.
var Modifiable = function() {
  this.listener_ = null;
}

// Should be overridden.
Modifiable.prototype.isModified = function() {
}

// Should be overridden.
Modifiable.prototype.clearModified = function() {
}

Modifiable.prototype.notifyListener = function() {
  if (this.listener_)
    this.listener_.onModifiedChanged();
}

var Setting = function() {
  Modifiable.call(this);
	this.value_ = null;
  this.originalValue_ = null;
  Object.defineProperty(this, "value", {
    enumerable: true,
    configurable: false,
    get: this.getValue,
    set: this.setValue
  });
}

Setting.prototype = Object.create(Modifiable.prototype);

Setting.prototype.setValue = function(aValue) {
  var wasModified = this.isModified();
  this.value_ = aValue;
  if (this.isModified() != wasModified)
    this.notifyListener();
}

Setting.prototype.getValue = function() {
  return this.value_;
}

Setting.prototype.isModified = function() {
  return (this.originalValue_ != this.value_);
}

Setting.prototype.clearModified = function() {
  this.originalValue_ = this.value_;
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
  var number = new module.Number(other.min, other.max);
  number.value = other.value;
  return number;
}

return module;

})();
