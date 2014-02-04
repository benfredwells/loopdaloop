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

  this.keyboard_ = keyboard;
  this.keyCode_ = keyChar.charCodeAt(0);
  this.note_ = note;
  this.octaveDelta_ = octaveDelta;
  this.instrument_ = instrument;
  this.playingNote_ = null;

  var isWhite = kKeyIsWhite[note];
  var offset = octaveDelta * kKeyOctaveOffset + kKeyOffset[note % ChromaticScale.notesInOctave];
  this.div.classList.add('key');
  if (isWhite) {
    this.div.classList.add('white');
  } else {
    this.div.classList.add('black');
  }

  this.text_ = document.createElement('span');
  this.text_.innerHTML = keyChar;
  this.div.appendChild(this.text_);

  // Set |key_| for touch handling.
  this.text_.key_ = this;
  this.div.key_ = this;

  var key = this;
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
  this.div.onmouseover = key.mouseOver;
  this.div.onmousedown = key.mouseDown;
  this.div.onmouseup = key.mouseUp;
}

PianoKey.prototype = Object.create(UI.Control.prototype);

PianoKey.prototype.handleKeyDown = function(event) {
  if (this.keyCode_ != event.keyCode)
    return;
  if (this.playingNote_)
    return;
  this.startPlaying();
  event.stopPropagation();
}

PianoKey.prototype.handleKeyUp = function(event) {
  if (this.keyCode_ != event.keyCode)
    return;
  if (!this.playingNote_)
    return;
  this.stopPlaying();
  event.stopPropagation();
}

PianoKey.prototype.handleResize = function() {
  var isWhite = kKeyIsWhite[this.note_];
  var offset = this.octaveDelta_ * kKeyOctaveOffset + kKeyOffset[this.note_ % ChromaticScale.notesInOctave];
  offset = (offset + 1) * (this.keyboard_.whiteKeyWidth_ / 2) + this.keyboard_.left_;
  var height;
  if (isWhite) {
    height = this.keyboard_.whiteKeyHeight_;
    this.div.style.width = asPixels(this.keyboard_.whiteKeyWidth_);
    this.div.style.left = asPixels(offset - (this.keyboard_.whiteKeyWidth_ / 2));
  } else {
    height = this.keyboard_.blackKeyHeight_;
    this.div.style.width = asPixels(this.keyboard_.blackKeyWidth_);
    this.div.style.left = asPixels(offset - (this.keyboard_.blackKeyWidth_ / 2));
  }
  this.div.style.height = asPixels(height);
  this.text_.style.top = asPixels(height - kTextOffset);
}

PianoKey.prototype.startPlaying = function() {
  if (this.playingNote_)
    return;

  this.playingNote_ = this.instrument_.createPlayedNote(
      this.keyboard_.context_,
      this.keyboard_.octave + this.octaveDelta_,
      this.note_);
  this.playingNote_.noteOn(0);
  this.div.classList.add('playing');
}

PianoKey.prototype.stopPlaying = function() {
  if (!this.playingNote_)
    return;

  this.playingNote_.noteOff(0);
  this.playingNote_ = null;
  this.div.classList.remove('playing');
}

module.Piano = function(parentElement, context, instrument) {
  UI.Control.call(this, parentElement);

  this.keys_ = [];
  this.mouseDown_ = false;
  this.mouseKey_ = null;
  this.touchKeys_ = [];
  this.context_ = context;

  for (var i = 0; i < kKeyShortcuts.length; i++) {
    this.keys_.push(new PianoKey(this,
                                 kKeyShortcuts[i],
                                 i % ChromaticScale.notesInOctave,
                                 Math.floor(i / ChromaticScale.notesInOctave),
                                 instrument));
  };

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
    key.handleKeyDown(event);
  });
}

module.Piano.prototype.handleKeyUp = function(event) {
  this.keys_.forEach(function(key) {
    key.handleKeyUp(event);
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

module.Piano.prototype.handleBlur = function(event) {
  if (this.mouseDown_)
    return;
  this.keys_.forEach(function(key) {
    key.stopPlaying();
  });
  this.touchKeys_ = [];
}

return module;

}());
