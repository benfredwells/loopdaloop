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

  var mouseMoveHandler = function(evt) {
    if (event.button == 0) {
      selector.updateForMousePosition_(event.clientX);
    }
  }
  var mouseDownHandler = function(evt) {
    if (event.button == 0) {
      window.onmousemove = mouseMoveHandler;
      selector.updateForMousePosition_(event.clientX);
    }
  }
  this.thumbDiv.onmousedown = mouseDownHandler;
  this.backgroundDiv.onmousedown = mouseDownHandler;

  this.currentOctave_ = kMinOctave;
  this.dragging_ = false;
}

module.Selector.prototype = Object.create(UI.Control.prototype);

var kPageSize = 56;

module.Selector.prototype.positionThumb_ = function() {
  var kThumbWidth = 137;
  var y = this.backgroundDiv.offsetTop;
  var backgroundX = this.backgroundDiv.offsetLeft;
  var delta = kPageSize * this.currentOctave_;
  var x = backgroundX + delta;
  this.thumbDiv.style.top = UI.asPixels(y);
  this.thumbDiv.style.left = UI.asPixels(x);
  this.thumbDiv.style.width = UI.asPixels(kThumbWidth);
}

module.Selector.prototype.updateForMousePosition_ = function(clientX) {
  var newOctave = this.currentOctave_;
  if (clientX < this.thumbDiv.offsetLeft) {
    var delta = clientX - this.backgroundDiv.offsetLeft;
    if (delta < 0)
      delta = 0;
    newOctave = kMinOctave + Math.floor(delta / kPageSize);
  } else if (clientX > this.thumbDiv.offsetLeft + this.thumbDiv.offsetWidth) {
    var delta = this.backgroundDiv.offsetLeft + this.backgroundDiv.offsetWidth - clientX;
    if (delta < 0)
      delta = 0;
    newOctave = kMaxOctave - Math.floor(delta/ kPageSize);
  }
  if (newOctave == this.currentOctave_)
    return;

  this.currentOctave_ = newOctave;
  this.positionThumb_();
  if (this.onoctavechange)
    this.onoctavechange();
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

module.Selector.prototype.handleMouseUp = function(event) {
  window.onmousemove = null;
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
