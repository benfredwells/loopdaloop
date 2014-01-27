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
module.kSecondsFormatter = new module.Formatter('', ' s');
module.kFrequencyFormatter = new module.Formatter('', ' Hz');

module.kSave = 'Save';
module.kSaveAs = 'Save As...';
module.kLoading = 'Loading';

module.kEnabled = 'Enabled';
module.kType = 'Type';
module.kContourType = 'Contour';
module.kSpeed = 'Speed';
module.kTimeConstant = 'Time Constant';
module.kAmplitude = 'Amplitude';
module.kOctaveOffset = 'Octave offset';
module.kNoteOffset = 'Semitone offset';
module.kDetune = 'Detune';
module.kFrequency = 'Frequency';
module.kOrder = 'Order';
module.kQ = 'Resonance';
module.kGain = 'Gain';
module.kWave = 'Wave';

module.kUnits = 'Units';
module.kSemitones = 'Semitones';
module.kOctaves = 'Octaves';
module.kPitchUnitDescriptions = {};
module.kPitchUnitDescriptions[AudioConstants.kSemitones] = module.kSemitones;
module.kPitchUnitDescriptions[AudioConstants.kOctaves] = module.kOctaves;

module.kSine = 'Sine';
module.kSquare = 'Square';
module.kSawtooth = 'Sawtooth';
module.kTriangle = 'Triangle';
module.kOscillatorTypeDescriptions = {};
module.kOscillatorTypeDescriptions[AudioConstants.kSineWave] = module.kSine;
module.kOscillatorTypeDescriptions[AudioConstants.kSquareWave] = module.kSquare;
module.kOscillatorTypeDescriptions[AudioConstants.kSawtoothWave] = module.kSawtooth;
module.kOscillatorTypeDescriptions[AudioConstants.kTriangleWave] = module.kTriangle;

module.kLowPass = 'Low Pass';
module.kHighPass = 'High Pass';

module.kSecondOrder = 'Second (12db / octave)';
module.kFourthOrder = 'Fourth (24db / octave)';
module.kSixthOrder = 'Sixth (36db / octave)';

module.kFlat = 'Flat';
module.kSweep = 'Sweep';
module.kOscillating = 'Oscillating';
module.kADSR = 'ADSR';
module.kNStage = 'N Stage';
module.kNStageOscillating = 'N Stage Oscillating';
module.kContourTypeDescriptions = {};
module.kContourTypeDescriptions[Contour.kFlatContour] = module.kFlat;
module.kContourTypeDescriptions[Contour.kSweepContour] = module.kSweep;
module.kContourTypeDescriptions[Contour.kOscillatingContour] = module.kOscillating;
module.kContourTypeDescriptions[Contour.kADSRContour] = module.kADSR;
module.kContourTypeDescriptions[Contour.kNStageContour] = module.kNStage;
module.kContourTypeDescriptions[Contour.kNStageOscillatingContour] = module.kNStageOscillating;

module.kValue = 'Value';
module.kMax = 'Maximum Value';
module.kMin = 'Minimum Value';
module.kInitialValue = 'Initial Value';
module.kAttackTime = 'Attack Time';
module.kSweepTime = 'Sweep Time';
module.kAttackValue = 'Attack Value';
module.kDecayTime = 'Decay Time';
module.kSustainValue = 'Sustain Value';
module.kReleaseTime = 'Release Time';
module.kFinalValue = 'Final Value';
module.kSweepEndValue = 'Sweep End Value';
module.kNumberOfStages = 'Nunber of Stages';
module.kStage1Duration = 'Stage 1 Duration';
module.kStage2BeginValue = 'Stage 2 Begin Value';
module.kStage2Duration = 'Stage 2 Duration';
module.kStage3BeginValue = 'Stage 3 Begin Value';
module.kStage3Duration = 'Stage 3 Duration';
module.kStage4BeginValue = 'Stage 4 Begin Value';
module.kStage4Duration = 'Stage 4 Duration';
module.kStage5BeginValue = 'Stage 5 Begin Value';
module.kStage5Duration = 'Stage 5 Duration';
module.kStage6BeginValue = 'Stage 6 Begin Value';
module.kStage6Duration = 'Stage 6 Duration';
module.kIntermediateStageBeginValues = {};
module.kIntermediateStageDurations = {};
module.kIntermediateStageBeginValues[0] = module.kStage2BeginValue;
module.kIntermediateStageDurations[0] = module.kStage2Duration;
module.kIntermediateStageBeginValues[1] = module.kStage3BeginValue;
module.kIntermediateStageDurations[1] = module.kStage3Duration;
module.kIntermediateStageBeginValues[2] = module.kStage4BeginValue;
module.kIntermediateStageDurations[2] = module.kStage4Duration;
module.kIntermediateStageBeginValues[3] = module.kStage5BeginValue;
module.kIntermediateStageDurations[3] = module.kStage5Duration;
module.kIntermediateStageBeginValues[4] = module.kStage6BeginValue;
module.kIntermediateStageDurations[4] = module.kStage6Duration;

module.kConstant = 'Constant';
module.kFading = 'Fading';
module.kSwelling = 'Swelling';
module.kOscillationTypeDescriptions = {};
module.kOscillationTypeDescriptions[Contour.kConstantOscillation] = module.kConstant;
module.kOscillationTypeDescriptions[Contour.kFadingOscillation] = module.kFading;
module.kOscillationTypeDescriptions[Contour.kSwellingOscillation] = module.kSwelling;

module.kPitch = 'Pitch';
module.kOscillator1 = 'Oscillator 1';
module.kOscillator2 = 'Oscillator 2';
module.kOscillator3 = 'Oscillator 3';
module.kFilter1 = 'Filter 1';
module.kFilter2 = 'Filter 2';
module.kEnvelope = 'Envelope';

module.kTest = 'Test';
module.kTestShortcut =' (T)';

return module;

}());
