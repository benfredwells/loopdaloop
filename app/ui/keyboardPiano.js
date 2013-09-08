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

////////////////////////////////////////////////////////////////////////////////
// Private
function asPixels(num) {
  return Math.round(num).toString() + 'px';
}

function KeyboardPianoKey(keyChar, note, octaveDelta, keyboard, instrument) {
  var key = this;

  //////////////////////////////////////////////////////////////////////////////
  // Sizing
  key.resize = function() {
    var isWhite = kKeyIsWhite[note];
    var offset = octaveDelta * kKeyOctaveOffset + kKeyOffset[note % 12];
    offset = (offset + 1) * (key.keyboard_.whiteKeyWidth_ / 2) + keyboard.left_;
    var height;
    if (isWhite) {
      height = key.keyboard_.whiteKeyHeight_;
      key.element_.style.width = asPixels(key.keyboard_.whiteKeyWidth_);
      key.element_.style.left = asPixels(offset - (key.keyboard_.whiteKeyWidth_ / 2));
    } else {
      height = key.keyboard_.blackKeyHeight_;
      key.element_.style.width = asPixels(key.keyboard_.blackKeyWidth_);
      key.element_.style.left = asPixels(offset - (key.keyboard_.blackKeyWidth_ / 2));
    }
    key.element_.style.height = asPixels(height);
    key.text_.style.top = asPixels(height - kTextOffset);
  }

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

////////////////////////////////////////////////////////////////////////////////
// Play control
KeyboardPianoKey.prototype.startPlaying = function() {
  if (this.playingNote_)
    return;

  this.playingNote_ = this.instrument_.createPlayedNote(
      this.keyboard_.octave + this.octaveDelta_,
      this.note_);
  this.playingNote_.noteOn(0);
  this.element_.classList.add('playing');
}

KeyboardPianoKey.prototype.stopPlaying = function() {
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

  keyboard.updateTouchKeys = function(event) {
    var oldTouchKeys = keyboard.touchKeys_;
    keyboard.touchKeys_ = [];
    for (var i = 0; i < event.touches.length; i++) {
      var touch = event.touches[i];
      var el = document.elementFromPoint(touch.pageX, touch.pageY);
      if (el && el.key_) {
        el.key_.startPlaying();
        var oldIndex = oldTouchKeys.indexOf(el.key_);
        if (oldIndex != -1)
          oldTouchKeys.splice(oldIndex, 1);
        keyboard.touchKeys_.push(el.key_);
      }
    }
    oldTouchKeys.forEach(function(key) {
      key.stopPlaying();
    });
  }
  
  keyboard.touchStart = function(event) {
    keyboard.updateTouchKeys(event);
    event.preventDefault();
  }

  keyboard.touchEnd = function(event) {
    keyboard.updateTouchKeys(event);
    event.preventDefault();
  }

  keyboard.touchMove = function(event) {
    keyboard.updateTouchKeys(event);
    event.preventDefault();
  }

  //////////////////////////////////////////////////////////////////////////////
  // Private fields.
  keyboard.keys_ = [];
  keyboard.mouseDown_ = false;
  keyboard.mouseKey_ = null;
  keyboard.touchKeys_ = [];

  //////////////////////////////////////////////////////////////////////////////
  // Setup events.
  keyboard.div.ontouchstart = keyboard.touchStart;
  keyboard.div.ontouchend = keyboard.touchEnd;
  keyboard.div.ontouchmove = keyboard.touchMove;

  //////////////////////////////////////////////////////////////////////////////
  // Setup keys.
  keyboard.keys_.push(new KeyboardPianoKey('Z',  0, 0, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('S',  1, 0, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('X',  2, 0, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('D',  3, 0, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('C',  4, 0, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('V',  5, 0, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('G',  6, 0, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('B',  7, 0, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('H',  8, 0, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('N',  9, 0, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('J', 10, 0, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('M', 11, 0, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('Q',  0, 1, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('2',  1, 1, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('W',  2, 1, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('3',  3, 1, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('E',  4, 1, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('R',  5, 1, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('5',  6, 1, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('T',  7, 1, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('6',  8, 1, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('Y',  9, 1, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('7', 10, 1, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('U', 11, 1, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('I',  0, 2, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('9',  1, 2, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('O',  2, 2, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('0',  3, 2, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('P',  4, 2, keyboard, instrument));
}

module.Piano.prototype = Object.create(UI.Control.prototype);

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
    key.resize();
  });
}

return module;

}());
