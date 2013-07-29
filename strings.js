Strings = (function() {

"use strict";
var module = {};

module.Formatter = function(prefix, suffix) {
  this.format = function(string) {
    return prefix + string + suffix;
  }
}

module.kEnabled = 'Enabled';
module.kType = 'Type';
module.kSpeed = 'Speed';
module.kAmplitude = 'Amplitude';
module.kOctaveOffset = 'Octave offset';
module.kNoteOffset = 'Semitone offset';
module.kDetune = 'Detune';
module.kFrequency = 'Frequency';
module.kQ = 'Resonance';
module.kGain = 'Gain';

module.kFlat = 'Flat';
module.kOscillating = 'Oscillating';
module.kADSR = 'ADSR';

module.kSine = 'Sine';
module.kSquare = 'Square';
module.kSawtooth = 'Sawtooth';
module.kTriangle = 'Triangle';

module.kLowPass = 'Low Pass';
module.kHighPass = 'High Pass';

module.kMaxFormatter = new module.Formatter('', ' of max');
module.kPercentFormatter = new module.Formatter('', '%');
module.kMultiplierFormatter = new module.Formatter('x', '');

return module;

}());
