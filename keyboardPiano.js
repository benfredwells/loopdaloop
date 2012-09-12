KeyboardPiano = (function() {

"use strict";
module = {};

////////////////////////////////////////////////////////////////////////////////
// Constants
var kKeyIsWhite = [true, false, true, false, true, true, false,
                  true, false, true, false, true];
var kKeyOffset = [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12];
var kKeyOctaveOffset = 14;
var kTextOffset = 30;

////////////////////////////////////////////////////////////////////////////////
// Private
function asPixels(num) {
  return Math.round(num).toString() + 'px';
}

function KeyboardPianoKey(keyChar, note, octaveDelta, keyboard, instrument) {
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
  offset = (offset + 1) * (key.keyboard_.whiteKeyWidth_ / 2) + keyboard.left_;
  var el = document.createElement('div');
  el.classList.add('key');
  var height;
  if (isWhite) {
    el.classList.add('white');
    height = key.keyboard_.whiteKeyHeight_;
    el.style.width = asPixels(key.keyboard_.whiteKeyWidth_);
    el.style.left = asPixels(offset - (key.keyboard_.whiteKeyWidth_ / 2));
  } else {
    el.classList.add('black');
    height = key.keyboard_.blackKeyHeight_;
    el.style.width = asPixels(key.keyboard_.blackKeyWidth_);
    el.style.left = asPixels(offset - (key.keyboard_.blackKeyWidth_ / 2));
  }
  el.style.height = asPixels(height);
  var text = document.createElement('span');
  text.innerHTML = keyChar;
  text.style.top = asPixels(height - kTextOffset);
  el.appendChild(text);
  el.onmouseover = key.mouseOver;
  el.onmousedown = key.mouseDown;
  el.onmouseup = key.mouseUp;
  key.keyboard_.div_.appendChild(el);

  key.element_ = el;
}

////////////////////////////////////////////////////////////////////////////////
// Play control
KeyboardPianoKey.prototype.startPlaying = function() {
  if (this.playingNote_)
    return;

  this.playingNote_ = this.instrument_.createPlayedNote(
      this.keyboard_.octave + this.octaveDelta_,
      this.note_);
  this.playingNote_.start();
  this.element_.classList.add('playing');
}

KeyboardPianoKey.prototype.stopPlaying = function() {
  if (!this.playingNote_)
    return;

  this.playingNote_.stop();
  this.playingNote_ = null;
  this.element_.classList.remove('playing');
}

////////////////////////////////////////////////////////////////////////////////
// Public
module.Piano = function(startOctave, instrument, div) {
  var keyboard = this;

  //////////////////////////////////////////////////////////////////////////////
  // Public fields
  keyboard.octave = startOctave;

  //////////////////////////////////////////////////////////////////////////////
  // Keyboard events.
  keyboard.onKeyDown = function(event) {
    keyboard.keys_.forEach(function(key) {
      key.down(event);
    });
  }

  keyboard.onKeyUp = function(event) {
    keyboard.keys_.forEach(function(key) {
      key.up(event);
    });
  }

  keyboard.onMouseUp = function(event) {
    keyboard.mouseDown_ = false;
    if (keyboard.mouseKey_)
      keyboard.mouseKey_.stopPlaying();
  }

  //////////////////////////////////////////////////////////////////////////////
  // Private fields.
  keyboard.keys_ = [];
  keyboard.div_ = div;
  var numWhites = 17;
  var maxWidth = div.clientWidth;
  keyboard.whiteKeyHeight_ = div.clientHeight - 2;
  keyboard.blackKeyHeight_ = Math.round(div.clientHeight * 0.8);
  keyboard.whiteKeyWidth_ = (maxWidth / numWhites) - 2;
  keyboard.blackKeyWidth_ = keyboard.whiteKeyWidth_ - 10;
  var gap = maxWidth - numWhites * keyboard.whiteKeyWidth_;
  keyboard.left_ = div.offsetLeft + gap / 2;
  keyboard.mouseDown_ = false;
  keyboard.mouseKey_ = null;

  //////////////////////////////////////////////////////////////////////////////
  // Setup keyboard events.
  window.onkeydown = keyboard.onKeyDown;
  window.onkeyup = keyboard.onKeyUp;
  window.onmouseup = keyboard.onMouseUp;

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

return module;

}());
