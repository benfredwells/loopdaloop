Strings = (function() {

"use strict";
var module = {};

module.Formatter = function(prefix, suffix) {
  this.format = function(string) {
    return prefix + string + suffix;
  }
}

module.kMaxFormatter = new module.Formatter('', ' of max');
module.kPercentFormatter = new module.Formatter('', '%');
module.kMultiplierFormatter = new module.Formatter('x', '');
module.kSecondsFormatter = new module.Formatter('', 's');

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

module.kSine = 'Sine';
module.kSquare = 'Square';
module.kSawtooth = 'Sawtooth';
module.kTriangle = 'Triangle';

module.kLowPass = 'Low Pass';
module.kHighPass = 'High Pass';

module.kFlat = 'Flat';
module.kOscillating = 'Oscillating';
module.kADSR = 'ADSR';

module.kValue = 'Value';
module.kCenterValue = 'Center Value';
module.kInitialValue = 'Initial Value';
module.kAttackDelay = 'Attack Delay';
module.kAttackTime = 'Attack Time';
module.kAttackValue = 'Attack Value';
module.kAttackHold = 'Attack Hold';
module.kDecayTime = 'Decay Time';
module.kSustainValue = 'Sustain Value';
module.kSustainHold = 'Sustain Hold';
module.kReleaseTime = 'Release Time';
module.kFinalValue = 'Final Value';

return module;

}());
