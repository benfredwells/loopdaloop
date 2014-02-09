"use strict";

var Setting = (function() {

var module = {};


// listener needs to implement onChanged.
var Modifiable = function() {
  this.listener_ = null;
  this.listening_ = false;
};

Modifiable.prototype.setListener = function(listener) {
  this.listener_ = listener;
};

Modifiable.prototype.notifyListener = function() {
  if (this.listening_ && this.listener_)
    this.listener_.onChanged();
};

Modifiable.prototype.startListening = function() {
  this.listening_ = true;
};

Modifiable.prototype.stopListening = function() {
  this.listening_ = false;
};

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
};

Setting.prototype = Object.create(Modifiable.prototype);

Setting.prototype.setValue = function(aValue) {
  this.value_ = aValue;
  this.notifyListener();
};

Setting.prototype.getValue = function() {
  return this.value_;
};

module.Choice = function(choices) {
  Setting.call(this);
  this.value = choices[0];
  this.choices = choices;
};

module.Choice.prototype = Object.create(Setting.prototype);

module.Boolean = function() {
  Setting.call(this);
  this.value = false;
};

module.Boolean.prototype = Object.create(Setting.prototype);

module.Number = function(min, max) {
  Setting.call(this);
  this.value = min;
  this.min = min;
  this.max = max;
};

module.Number.prototype = Object.create(Setting.prototype);

module.Number.prototype.copy = function() {
  var number = new module.Number(this.min, this.max);
  number.value = this.value;
  return number;
};

module.ModifiableGroup = function() {
  Modifiable.call(this);
  this.modifiables_ = [];
};

module.ModifiableGroup.prototype = Object.create(Modifiable.prototype);

// This is called by this group's sub modifiables.
module.ModifiableGroup.prototype.onChanged = function() {
  this.notifyListener();
};

module.ModifiableGroup.prototype.addModifiable = function(modifiable) {
  this.modifiables_.push(modifiable);
  modifiable.setListener(this);
  return modifiable;
};

module.ModifiableGroup.prototype.startListening = function() {
  Modifiable.prototype.startListening.call(this);
  this.modifiables_.forEach(function(modifiable) {
    modifiable.startListening();
  });
};

module.ModifiableGroup.prototype.stopListening = function() {
  Modifiable.prototype.stopListening.call(this);
  this.modifiables_.forEach(function(modifiable) {
    modifiable.stopListening();
  });
};

return module;

})();
