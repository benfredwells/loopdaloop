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

Modifiable.prototype.setListener = function(listener) {
  this.listener_ = listener;
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

module.ModifiableGroup = function() {
  Modifiable.call(this);
  this.modifiables_ = [];
  this.wasModified_ = false;
}

module.ModifiableGroup.prototype = Object.create(Modifiable.prototype);

module.ModifiableGroup.prototype.isModified = function() {
  for (var i = 0; i < this.modifiables_.length; i++) {
    if (this.modifiables_[i].isModified())
      return true;
  }
  return false;
}

module.ModifiableGroup.prototype.clearModified = function() {
  this.wasModified_ = false;
  this.modifiables_.forEach(function (modifiable) {
    modifable.clearModified();
  });
}

// This is called by this group's sub modifiables.
module.ModifiableGroup.prototype.onModifiedChanged = function() {
  if (this.wasModified_ != this.isModified())
    this.notifyListener();
  this.wasModified_ = this.isModified();
}

module.ModifiableGroup.prototype.addModifiable = function(modifiable) {
  this.modifiables_.push(modifiable);
  modifiable.setListener(this);
  this.onModifiedChanged();
  return modifiable;
}

return module;

})();
