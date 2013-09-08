OctaveUI = (function() {

"use strict";
var module = {};

var kMinOctave = 0;
var kMaxOctave = 7;

module.Selector = function(container) {
  UI.Control.call(this, container);

  this.div.id = 'octaveSelectorContainer';
  
  var downButton = document.createElement('div');
  downButton.classList.add('octaveShortcut');
  downButton.innerHTML = '&larr;';
  this.div.appendChild(downButton);

  this.backgroundDiv = document.createElement('div');
  this.backgroundDiv.id = 'octaveSelectBackground';
  this.div.appendChild(this.backgroundDiv);

  var upButton = document.createElement('div');
  upButton.classList.add('octaveShortcut');
  upButton.innerHTML = '&rarr;';
  this.div.appendChild(upButton);

  var selector = this;
  var buttonClickHandler = function(evt) {
    if (evt.button != 0)
      return;

    if (this == downButton) {
      selector.downOctave();
    } else {
      selector.upOctave();
    }
  }
  upButton.onclick = buttonClickHandler;
  downButton.onclick = buttonClickHandler;

  this.thumbDiv = document.createElement('div');
  this.thumbDiv.id = 'octaveThumb';
  this.div.appendChild(this.thumbDiv);

  this.currentOctave_ = kMinOctave;
}

module.Selector.prototype = Object.create(UI.Control.prototype);

module.Selector.prototype.positionThumb_ = function() {
  var kThumbWidth = 137;
  var kPageSize = 56;
  var y = this.backgroundDiv.offsetTop;
  var backgroundX = this.backgroundDiv.offsetLeft;
  var delta = kPageSize * this.currentOctave_;
  var x = backgroundX + delta;
  this.thumbDiv.style.left = UI.asPixels(x);
  this.thumbDiv.style.width = UI.asPixels(137);
}

module.Selector.prototype.downOctave = function() {
  if (this.currentOctave_ == kMinOctave)
    return;

  this.currentOctave_--;
  this.positionThumb_();
}

module.Selector.prototype.upOctave = function() {
  if (this.currentOctave_ == kMaxOctave)
    return;

  this.currentOctave_++;
  this.positionThumb_();
}

module.Selector.prototype.handleResize = function() {
  this.positionThumb_();
}

return module;

}());
