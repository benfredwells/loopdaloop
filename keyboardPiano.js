function Key(startOctave, instrument) {
  key = this;

  //////////////////////////////////////////////////////////////////////////////
  // Public fields
  key.keyCode = keyCode;
  key.octave = octave;
  key.note = note;

  key.down = function() {
    if (key.playingNote_)
      return;
    key.playingNote_ = key.instrument_.createPlayedNote(key.octave, key.note);
    key.playingNote_.start();
  }

  key.up = function() {
    if (!key.playingNote_)
      return;
    key.playingNote_.stop();
    key.playingNote_ = null;
  }

  //////////////////////////////////////////////////////////////////////////////
  // Private fields
  key.instrument_ = instrument;
  key.playingNote_ = null;
}