UI = (function() {

"use strict";
var module = {};

// Container cal be a DOM element or another Control
module.Control = function(container) {
  this.div = document.createElement('div');
  var containerEl = container;
  if (container.div)
    containerEl = container.div;
  containerEl.appendChild(this.div);
  this.enabled_ = true;
  this.visible_ = true;
}

module.Control.prototype.updateHidden_ = function() {
  this.div.hidden = !this.visible_ || !this.enabled_;
}

module.Control.prototype.setVisible = function(visible) {
  this.visible_ = visible;
  this.updateHidden_();
}

module.Control.prototype.isVisible = function() {
  return this.visible_;
}

module.Control.prototype.setEnabled = function(enabled) {
  this.enabled_ = enabled;
  this.updateHidden_();
}

module.Control.prototype.isEnabled = function() {
  return this.enabled_;
}

module.Panel = function(container) {
  module.Control.call(this, container);
}

module.Panel.prototype = Object.create(module.Control.prototype);

return module;

})();
