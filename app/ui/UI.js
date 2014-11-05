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

module.Button = function(container, onpressed, caption) {
  module.Control.call(this, container);

  this.div.classList.add('button');
  this.div.tabIndex = 0;

  if (caption != '') {
    this.textDiv = document.createElement('div');
    this.textDiv.classList.add('buttonText');
    this.textDiv.innerHTML = caption;
    this.div.appendChild(this.textDiv);
  }

  this.onpressed_ = onpressed;
  this.div.onmousedown = this.handleMouseDown.bind(this);
  this.div.onmouseup = this.handleMouseUp.bind(this);
  this.div.onmouseleave = this.handleMouseLeave.bind(this);
  this.div.ontouchstart = this.handleTouchStart.bind(this);
  this.div.ontouchend = this.handleTouchEnd.bind(this);
  this.div.onkeydown = this.handleKeyDown.bind(this);
  this.div.onkeyup = this.handleKeyUp.bind(this);
  this.div.onblur = this.handleBlur.bind(this);
  this.pressed_ = false;
};

module.Button.prototype = Object.create(module.Control.prototype);

module.Button.prototype.fire_ = function(event) {
  if (this.onpressed_)
    this.onpressed_();
};

module.Button.prototype.press_ = function(event) {
  this.pressed_ = true;
  this.div.classList.add('pressed');
};

module.Button.prototype.unpress_ = function(event) {
  this.pressed_ = false;
  this.div.classList.remove('pressed');
};

module.Button.prototype.handleMouseDown = function(event) {
  if (event.button == 0)
    this.press_();
};

module.Button.prototype.handleMouseUp = function(event) {
  if (event.button == 0 && this.pressed_) {
    this.unpress_();
    this.fire_();
  }
};

module.Button.prototype.handleMouseLeave = function(event) {
  this.unpress_();
};

module.Button.prototype.handleTouchStart = function(event) {
  this.press_();
  event.preventDefault();
};

module.Button.prototype.handleTouchEnd = function(event) {
  if (this.pressed_)
    this.unpress_();
  event.preventDefault();
};

module.Button.prototype.handleKeyDown = function(event) {
  if (event.keyCode == ' '.charCodeAt(0))
    this.press_();
};

module.Button.prototype.handleKeyUp = function(event) {
  if (event.keyCode == ' '.charCodeAt(0) && this.pressed_) {
    this.unpress_();
    this.fire_();
  }
};

module.Button.prototype.handleBlur = function(event) {
  this.unpress_();
};

return module;

})();
