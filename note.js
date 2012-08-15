(function() {
// Exported globals
window.gNotes = ['C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb',
              'G', 'G#/Ab', 'A', 'A#/Bb', 'B'];
// Middle A frequency could be overridden, so it's exposed.
window.gMiddleAFrequency = 440;

// Constants for working out note frequencies
var gMiddleAIndex = (4 * 12) + 9;
var gNoteFactor = Math.pow(2, 1 / 12);

// Exported functions
window.frequencyForNote = function(octave, note) {
  var noteIndex = (12 * octave) + note;
  return gMiddleAFrequency * Math.pow(gNoteFactor, noteIndex - gMiddleAIndex);
};

})();