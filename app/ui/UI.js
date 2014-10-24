UI = (function() {

"use strict";
var module = {};

module.asPixels = function(num) {
  return Math.round(num).toString() + 'px';
}

// Container cal be a DOM element or another Control
module.Control = function(container) {
  this.div = document.createElement('div');
  this.children = [];
  var containerEl = container;
  if (!containerEl) {
    containerEl = document.body;
  }
  if (containerEl.div) {
    containerEl = container.div;
    container.children.push(this);
  }
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

module.Control.prototype.updateDisplay = function() {
  this.children.forEach(function(child) {
    child.updateDisplay();
  });
}

module.Panel = function(container) {
  module.Control.call(this, container);
}

module.Panel.prototype = Object.create(module.Control.prototype);

module.Button = function(container, onclick, caption) {
  module.Control.call(this, container);

  this.div.classList.add('button');

  this.textDiv = document.createElement('div');
  this.textDiv.classList.add('buttonText');
  this.textDiv.innerHTML = caption;
  this.div.appendChild(this.textDiv);

  this.div.onclick = onclick;
  this.div.onkeydown = this.handleKeyDown.bind(this);
  this.div.onkeyup = this.handleKeyUp.bind(this);
  this.div.onblur = this.handleBlur.bind(this);
  this.pressedWithKey = false;
}

module.Button.prototype = Object.create(module.Control.prototype);

module.Button.prototype.handleKeyDown = function(event) {
  if (event.keyCode == ' '.charCodeAt(0))
    this.pressedWithKey = true;
}

module.Button.prototype.handleKeyUp = function(event) {
  if (event.keyCode == ' '.charCodeAt(0) && this.pressedWithKey) {
    this.pressedWithKey = false;
    this.div.onclick();
  }
}

module.Button.prototype.handleBlur = function(event) {
  this.pressedWithKey = false;
}

return module;

})();
