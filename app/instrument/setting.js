"use strict";

var Setting = (function() {

var module = {};


// listener needs to implement onChanged.
var Listenable = function() {
  this.listener_ = null;
  this.listening_ = false;
};

Listenable.prototype.setListener = function(listener) {
  this.listener_ = listener;
};

Listenable.prototype.notifyListener = function() {
  if (this.listening_ && this.listener_)
    this.listener_.onChanged();
};

Listenable.prototype.startListening = function() {
  this.listening_ = true;
};

Listenable.prototype.stopListening = function() {
  this.listening_ = false;
};

var Setting = function() {
  Listenable.call(this);
	this.value_ = null;
  this.originalValue_ = null;
  Object.defineProperty(this, "value", {
    enumerable: true,
    configurable: false,
    get: this.getValue,
    set: this.setValue
  });
};

Setting.prototype = Object.create(Listenable.prototype);

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

module.ListenableGroup = function() {
  Listenable.call(this);
  this.listenables_ = [];
};

module.ListenableGroup.prototype = Object.create(Listenable.prototype);

// This is called by this group's sub listenables.
module.ListenableGroup.prototype.onChanged = function() {
  this.notifyListener();
};

module.ListenableGroup.prototype.addListenable = function(listenable) {
  this.listenables_.push(listenable);
  listenable.setListener(this);
  return listenable;
};

module.ListenableGroup.prototype.startListening = function() {
  Listenable.prototype.startListening.call(this);
  this.listenables_.forEach(function(listenable) {
    listenable.startListening();
  });
};

module.ListenableGroup.prototype.stopListening = function() {
  Listenable.prototype.stopListening.call(this);
  this.listenables_.forEach(function(listenable) {
    listenable.stopListening();
  });
};

return module;

})();
