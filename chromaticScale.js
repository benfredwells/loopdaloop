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
var middleAIndex = (4 * 12) + 9;
var noteFactor = Math.pow(2, 1 / 12);

////////////////////////////////////////////////////////////////////////////////
// Exported functions
module.frequencyForNote = function(octave, note) {
  var noteIndex = (12 * octave) + note;
  return module.middleAFrequency * Math.pow(noteFactor, noteIndex - middleAIndex);
};

return module;

})();
