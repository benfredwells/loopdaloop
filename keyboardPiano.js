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
  }

  key.up = function(keyCode) {
    if (key.keyCode_ != keyCode)
      return;
    if (!key.playingNote_)
      return;
    key.playingNote_.stop();
    key.playingNote_ = null;
  }

  //////////////////////////////////////////////////////////////////////////////
  // Private fields
  key.keyboard_ = keyboard;
  key.keyCode_ = keyChar.charCodeAt(0);
  key.note_ = note;
  key.octaveDelta_ = octaveDelta;
  key.instrument_ = instrument;
  key.playingNote_ = null;
}

function KeyboardPiano(startOctave, instrument) {
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

  //////////////////////////////////////////////////////////////////////////////
  // Setup keys.
  keyboard.keys_.push(new KeyboardPianoKey('A',  0, 0, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('W',  1, 0, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('S',  2, 0, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('E',  3, 0, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('D',  4, 0, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('F',  5, 0, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('T',  6, 0, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('G',  7, 0, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('Y',  8, 0, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('H',  9, 0, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('U', 10, 0, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('J', 11, 0, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('K',  0, 1, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('O',  1, 1, keyboard, instrument));
  keyboard.keys_.push(new KeyboardPianoKey('L',  2, 1, keyboard, instrument));
}