ChromaticScale = (function() {

"use strict";
var module = [];

////////////////////////////////////////////////////////////////////////////////
// Exported globals
module.notes = ['C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb',
                'G', 'G#/Ab', 'A', 'A#/Bb', 'B'];
// Middle A frequency could be overridden, so it's exposed.
module.middleAFrequency = 440;

////////////////////////////////////////////////////////////////////////////////
// Constants for working out note frequencies
var kMiddleAIndex = (4 * 12) + 9;
var kNoteFactor = Math.pow(2, 1 / 12);

////////////////////////////////////////////////////////////////////////////////
// Exported functions
module.frequencyForNote = function(octave, note) {
  var noteIndex = (12 * octave) + note;
  return module.middleAFrequency * Math.pow(kNoteFactor, noteIndex - kMiddleAIndex);
};

return module;

})();
