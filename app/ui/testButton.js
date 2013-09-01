TestButton = (function() {

"use strict";
var module = {};

module.Button = function(parentDiv) {
  SettingsUI.Control.call(this, parentDiv);
  this.div.id = 'testButton';

  this.textDiv = document.createElement('div');
  this.textDiv.id = 'testButtonText';
  this.textDiv.innerHTML = Strings.kTest;
  this.div.appendChild(this.textDiv);
  
  this.shortcutSpan = document.createElement('span');
  this.shortcutSpan.id = 'testButtonShortcut';
  this.shortcutSpan.innerHTML = Strings.kTestShortcut;
  this.textDiv.appendChild(this.shortcutSpan);

  this.pressed = false;

  var button = this;
  this.div.onmousedown = function(event) { button.buttonMouseDown(event); };
  this.div.onmouseup = function(event) { button.buttonMouseUp(event); };
  this.div.onmouseleave = function(event) { button.buttonMouseLeave(event); };
  window.onkeydown = function(event) { button.keyDown(event); };
  window.onkeyup = function(event) { button.keyUp(event); };
}

module.Button.prototype = Object.create(SettingsUI.Control.prototype);

module.Button.prototype.press_ = function() {
  this.pressed = true;
  this.div.classList.add('pressed');
}

module.Button.prototype.release_ = function() {
  this.pressed = false;
  this.div.classList.remove('pressed');
}

module.Button.prototype.buttonMouseDown = function(event) {
  if (event.button == 0)
    this.press_();
}

module.Button.prototype.buttonMouseUp = function(event) {
  if (event.button == 0)
    this.release_();
}

module.Button.prototype.buttonMouseLeave = function(event) {
  if (this.pressed)
    this.release_();
}

module.Button.prototype.keyDown = function(event) {
  if (event.keyCode == 'T'.charCodeAt(0))
    this.press_();
}

module.Button.prototype.keyUp = function(event) {
  if (event.keyCode == 'T'.charCodeAt(0))
    this.release_();
}

return module;

})();
