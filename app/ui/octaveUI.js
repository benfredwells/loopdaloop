OctaveUI = (function() {

"use strict";
var module = {};

var kMinOctave = 0;
var kMaxOctave = 7;

module.Selector = function(container, onoctavechange) {
  UI.Control.call(this, container);

  this.div.id = 'octaveSelectorContainer';
  this.onoctavechange = onoctavechange;
  
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
      selector.downOctave_();
    } else {
      selector.upOctave_();
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
  this.thumbDiv.style.top = UI.asPixels(y);
  this.thumbDiv.style.left = UI.asPixels(x);
  this.thumbDiv.style.width = UI.asPixels(137);
}

module.Selector.prototype.downOctave_ = function() {
  if (this.currentOctave_ <= kMinOctave)
    return;

  this.currentOctave_--;
  this.positionThumb_();
  if (this.onoctavechange)
    this.onoctavechange();
}

module.Selector.prototype.upOctave_ = function() {
  if (this.currentOctave_ >= kMaxOctave)
    return;

  this.currentOctave_++;
  this.positionThumb_();
  if (this.onoctavechange)
    this.onoctavechange();
}

module.Selector.prototype.handleResize = function() {
  this.positionThumb_();
}

module.Selector.prototype.handleKeyDown = function(event) {
  if (event.keyCode == 37) { // down arrow is 37
    this.downOctave_();
  } else if (event.keyCode == 39) { // up arrow is 39
    this.upOctave_();
  }
}

module.Selector.prototype.currentOctave = function() {
  return this.currentOctave_;
}

module.Selector.prototype.setCurrentOctave = function(octave) {
  this.currentOctave_ = octave;
  this.positionThumb_();
}

return module;

}());
