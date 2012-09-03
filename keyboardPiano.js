var gKeyIsWhite = [true, false, true, false, true, true, false,
                  true, false, true, false, true];
var gKeyOffset = [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12];
var gKeyOctaveOffset = 14;
var gTextOffset = 30;

function asPixels(num) {
  return Math.round(num).toString() + 'px';
}

function KeyboardPianoKey(keyChar, note, octaveDelta, keyboard, instrument) {
  var key = this;

  //////////////////////////////////////////////////////////////////////////////
  // Key events
  key.down = function(keyCode) {
    if (key.keyCode_ != keyCode)
      return;
    if (key.playingNote_)
      return;
    key.playingNote_ = key.instrument_.createPlayedNote(
        key.keyboard_.octave + key.octaveDelta_,
        key.note_);
    key.playingNote_.start();
    key.element_.classList.add('playing');
  }

  key.up = function(keyCode) {
    if (key.keyCode_ != keyCode)
      return;
    if (!key.playingNote_)
      return;
    key.playingNote_.stop();
    key.playingNote_ = null;
    key.element_.classList.remove('playing');
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
  var isWhite = gKeyIsWhite[note];
  var offset = octaveDelta * gKeyOctaveOffset + gKeyOffset[note % 12];
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
  text.style.top = asPixels(height - gTextOffset);
  el.appendChild(text);
  key.keyboard_.div_.appendChild(el);

  key.element_ = el;
}

function KeyboardPiano(startOctave, instrument, div) {
  var keyboard = this;

  //////////////////////////////////////////////////////////////////////////////
  // Public fields
  keyboard.octave = startOctave;

  //////////////////////////////////////////////////////////////////////////////
  // Keyboard events.
  keyboard.onKeyDown = function(event) {
    keyboard.keys_.forEach(function(key) {
      key.down(event.keyCode);
    });
  }

  keyboard.onKeyUp = function(event) {
    keyboard.keys_.forEach(function(key) {
      key.up(event.keyCode);
    });
  }

  //////////////////////////////////////////////////////////////////////////////
  // Setup window events.
  window.onkeydown = keyboard.onKeyDown;
  window.onkeyup = keyboard.onKeyUp;

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