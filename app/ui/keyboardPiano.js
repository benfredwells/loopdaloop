KeyboardPiano = (function() {

"use strict";
var module = {};

////////////////////////////////////////////////////////////////////////////////
// Constants
var kKeyIsWhite = [true, false, true, false, true, true, false,
                  true, false, true, false, true];
var kKeyOffset = [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12];
var kKeyOctaveOffset = 14;
var kTextOffset = 30;
var kKeyboardHeightGap = 95;

var kKeyShortcuts = ['Z', 'S', 'X', 'D', 'C', 'V', 'G', 'B', 'H', 'N',
                     'J', 'M', 'Q', '2', 'W', '3', 'E', 'R', '5', 'T',
                     '6', 'Y', '7', 'U', 'I', '9', 'O', '0', 'P'];

////////////////////////////////////////////////////////////////////////////////
// Private
function asPixels(num) {
  return Math.round(num).toString() + 'px';
}

function PianoKey(keyboard, keyChar, note, octaveDelta, instrument) {
  UI.Control.call(this, keyboard);
  var key = this;


  //////////////////////////////////////////////////////////////////////////////
  // Key events
  key.down = function(event) {
    if (key.keyCode_ != event.keyCode)
      return;
    if (key.playingNote_)
      return;
    key.startPlaying();
    event.stopPropagation();
  }

  key.up = function(event) {
    if (key.keyCode_ != event.keyCode)
      return;
    if (!key.playingNote_)
      return;
    key.stopPlaying();
    event.stopPropagation();
  }

  key.mouseOver = function(event) {
    if (keyboard.mouseDown_ && keyboard.mouseKey_ != key) {
      if (keyboard.mouseKey_)
        keyboard.mouseKey_.stopPlaying();
      keyboard.mouseKey_ = key;
      key.startPlaying();
    }
  }

  key.mouseDown = function(event) {
    if (event.button == 0) {
      keyboard.mouseDown_ = true;
      keyboard.mouseKey_ = key;
      key.startPlaying();
    }
  }

  key.mouseUp = function(event) {
    if (event.button == 0) {
      keyboard.mouseDown_ = false;
      keyboard.mouseKey_ = null;
      key.stopPlaying();
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // Private fields
  key.keyboard_ = keyboard;
  key.keyCode_ = keyChar.charCodeAt(0);
  key.note_ = note;
  key.octaveDelta_ = octaveDelta;
  key.instrument_ = instrument;
  key.playingNote_ = null;

  //////////////////////////////////////////////////////////////////////////////
  // Create UI
  var isWhite = kKeyIsWhite[note];
  var offset = octaveDelta * kKeyOctaveOffset + kKeyOffset[note % 12];
  var el = document.createElement('div');
  el.classList.add('key');
  if (isWhite) {
    el.classList.add('white');
  } else {
    el.classList.add('black');
  }
  var text = document.createElement('span');
  text.innerHTML = keyChar;
  text.key_ = key;
  el.appendChild(text);
  el.onmouseover = key.mouseOver;
  el.onmousedown = key.mouseDown;
  el.onmouseup = key.mouseUp;
  el.key_ = key;
  key.keyboard_.div.appendChild(el);
  key.element_ = el;
  key.text_ = text;
}

PianoKey.prototype = Object.create(UI.Control.prototype);

PianoKey.prototype.handleResize = function() {
  var isWhite = kKeyIsWhite[this.note_];
  var offset = this.octaveDelta_ * kKeyOctaveOffset + kKeyOffset[this.note_ % ChromaticScale.notesInOctave];
  offset = (offset + 1) * (this.keyboard_.whiteKeyWidth_ / 2) + this.keyboard_.left_;
  var height;
  if (isWhite) {
    height = this.keyboard_.whiteKeyHeight_;
    this.element_.style.width = asPixels(this.keyboard_.whiteKeyWidth_);
    this.element_.style.left = asPixels(offset - (this.keyboard_.whiteKeyWidth_ / 2));
  } else {
    height = this.keyboard_.blackKeyHeight_;
    this.element_.style.width = asPixels(this.keyboard_.blackKeyWidth_);
    this.element_.style.left = asPixels(offset - (this.keyboard_.blackKeyWidth_ / 2));
  }
  this.element_.style.height = asPixels(height);
  this.text_.style.top = asPixels(height - kTextOffset);
}

////////////////////////////////////////////////////////////////////////////////
// Play control
PianoKey.prototype.startPlaying = function() {
  if (this.playingNote_)
    return;

  this.playingNote_ = this.instrument_.createPlayedNote(
      this.keyboard_.octave + this.octaveDelta_,
      this.note_);
  this.playingNote_.noteOn(0);
  this.element_.classList.add('playing');
}

PianoKey.prototype.stopPlaying = function() {
  if (!this.playingNote_)
    return;

  this.playingNote_.noteOff(0);
  this.playingNote_ = null;
  this.element_.classList.remove('playing');
}

////////////////////////////////////////////////////////////////////////////////
// Public
module.Piano = function(parentElement, instrument) {
  UI.Control.call(this, parentElement);

  var keyboard = this;
  var touchStart = function(event) {
    keyboard.updateTouchKeys_(event);
    event.preventDefault();
  }
  var touchEnd = function(event) {
    keyboard.updateTouchKeys_(event);
    event.preventDefault();
  }
  var touchMove = function(event) {
    keyboard.updateTouchKeys_(event);
    event.preventDefault();
  }
  this.div.ontouchstart = touchStart;
  this.div.ontouchend = touchEnd;
  this.div.ontouchmove = touchMove;

  this.keys_ = [];
  this.mouseDown_ = false;
  this.mouseKey_ = null;
  this.touchKeys_ = [];

  for (var i = 0; i < kKeyShortcuts.length; i++) {
    this.keys_.push(new PianoKey(keyboard,
                                 kKeyShortcuts[i],
                                 i % ChromaticScale.notesInOctave,
                                 Math.floor(i / ChromaticScale.notesInOctave),
                                 instrument));
  };
}

module.Piano.prototype = Object.create(UI.Control.prototype);

module.Piano.prototype.updateTouchKeys_ = function(event) {
  var oldTouchKeys = this.touchKeys_;
  this.touchKeys_ = [];
  for (var i = 0; i < event.touches.length; i++) {
    var touch = event.touches[i];
    var el = document.elementFromPoint(touch.pageX, touch.pageY);
    if (el && el.key_) {
      el.key_.startPlaying();
      var oldIndex = oldTouchKeys.indexOf(el.key_);
      if (oldIndex != -1)
        oldTouchKeys.splice(oldIndex, 1);
      this.touchKeys_.push(el.key_);
    }
  }
  oldTouchKeys.forEach(function(key) {
    key.stopPlaying();
  });
}

module.Piano.prototype.handleKeyDown = function(event) {
  this.keys_.forEach(function(key) {
    key.down(event);
  });
}

module.Piano.prototype.handleKeyUp = function(event) {
  this.keys_.forEach(function(key) {
    key.up(event);
  });
}

module.Piano.prototype.handleMouseUp = function(event) {
  this.mouseDown_ = false;
  if (this.mouseKey_)
    this.mouseKey_.stopPlaying();
}

module.Piano.prototype.handleResize = function(event) {
  var numWhites = 17;
  this.div.style.height = asPixels(window.innerHeight - kKeyboardHeightGap);
  var maxWidth = this.div.clientWidth;
  this.whiteKeyHeight_ = this.div.clientHeight - 2;
  this.blackKeyHeight_ = Math.round(this.div.clientHeight * 0.75);
  this.whiteKeyWidth_ = (maxWidth / numWhites);
  this.blackKeyWidth_ = this.whiteKeyWidth_ - 10;
  var gap = maxWidth - numWhites * this.whiteKeyWidth_;
  this.left_ = this.div.offsetLeft + gap / 2;
  this.keys_.forEach(function(key) {
    key.handleResize();
  });
}

return module;

}());
