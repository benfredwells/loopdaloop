AudioConstants = (function() {

"use strict";
var module = {};

////////////////////////////////////////////////////////////////////////////////
// Identifiers for pitch
module.kSemitones = 'semitone';
module.kOctaves = 'octave';
module.kPitchUnits = [module.kSemitones, module.kOctaves];

////////////////////////////////////////////////////////////////////////////////
// Identifiers for waves
module.kSineWave = 'sine';
module.kSquareWave = 'square';
module.kSawtoothWave = 'sawtooth';
module.kTriangleWave = 'triangle';
module.kWaveTypes = [module.kSineWave, module.kSquareWave, module.kSawtoothWave, module.kTriangleWave];

////////////////////////////////////////////////////////////////////////////////
// Identifiers for filter types
module.kLowPassFilter = 'lowpass';
module.kHighPassFilter = 'highpass';
module.kFilterTypes = [module.kLowPassFilter, module.kHighPassFilter];

////////////////////////////////////////////////////////////////////////////////
// Identifiers for filter strength
module.kSecondOrder = 'second';
module.kFourthOrder = 'fourth';
module.kSixthOrder = 'sixth';
module.kFilterOrders = [module.kSecondOrder, module.kFourthOrder, module.kSixthOrder];

module.kFilterOrderNodes = {};
module.kFilterOrderNodes[module.kSecondOrder] = 1;
module.kFilterOrderNodes[module.kFourthOrder] = 2;
module.kFilterOrderNodes[module.kSixthOrder] = 3;

////////////////////////////////////////////////////////////////////////////////
// Identifiers for contours
//
// There is one more set of stage values for the sustain.
module.kMaxIntermediateStageValues = 6;
module.kMaxIntermediateStages =  module.kMaxIntermediateStageValues - 1;
module.kMinStages = 3;
module.kMaxStages = module.kMinStages + module.kMaxIntermediateStages;

module.kConstantOscillation = 'constant';
module.kSwellingOscillation = 'swell';
module.kFadingOscillation = 'fade';
module.kOscillationTypes = [module.kConstantOscillation,
                            module.kSwellingOscillation,
                            module.kFadingOscillation];

////////////////////////////////////////////////////////////////////////////////
// Identifiers for contour types
module.kFlatContour = 'flat';
module.kOscillatingContour = 'oscillating';
module.kADSRContour = 'adsr';
module.kNStageContour = 'nstage';
module.kNStageOscillatingContour = 'nstageoscillating';
module.kSweepContour = 'sweep';
module.kEnvelopeContourTypes = [module.kFlatContour,
                                module.kOscillatingContour,
                                module.kADSRContour,
                                module.kNStageContour,
                                module.kNStageOscillatingContour];
module.kContourTypes = [module.kFlatContour,
                        module.kSweepContour,
                        module.kOscillatingContour,
                        module.kADSRContour,
                        module.kNStageContour,
                        module.kNStageOscillatingContour];

return module;

}());
