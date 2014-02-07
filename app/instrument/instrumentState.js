InstrumentState = (function() {

"use strict";

var module = {};

function reportError(error) {
  console.log('Error: ' + error);
  console.trace();
}

function updateSetting(setting, value, defaultValue) {
  if (value != null) {
    setting.value = value;
  } else {
    setting.value = defaultValue;
  }
}

function updateSettingWithMaxDefault(setting, value) {
  updateSetting(setting, value, setting.max);
}

function updateSettingWithMinDefault(setting, value) {
  updateSetting(setting, value, setting.min);
}

function updateSettingWithMidDefault(setting, value) {
  updateSetting(setting, value, (setting.max + setting.min) / 2);
}

function updateSettingWithRatioedDefault(setting, value, ratio) {
  updateSetting(setting, value, (setting.max + setting.min) * ratio);
}

function updateIntermediateContourStage(intermediateStages, intermediateStageStates, index) {
  var intermediateStageState = {};
  if (intermediateStageStates && intermediateStageStates[index]) {
    intermediateStageState = intermediateStageStates[index];
  }
  // Make first stage max
  if (index == 0) {
    updateSettingWithMaxDefault(intermediateStages[index].beginValueSetting, intermediateStageState.beginValue);
  } else {
    updateSettingWithMidDefault(intermediateStages[index].beginValueSetting, intermediateStageState.beginValue);
  }
  updateSettingWithMinDefault(intermediateStages[index].durationSetting, intermediateStageState.duration);
}

function getIntermediateContourStageState(intermediateStage) {
  var intermediateStageState = {};

  intermediateStageState.beginValue = intermediateStage.beginValueSetting.value;
  intermediateStageState.duration = intermediateStage.durationSetting.value;

  return intermediateStageState;
}

function updateContouredValue(contouredValue, contouredValueState) {
  if (!contouredValueState) {
    contouredValueState = {};
    contouredValueState.contours = {};
  }
  updateSetting(contouredValue.currentContourSetting, contouredValueState.currentContour, AudioConstants.kFlatContour);
  updateSettingWithMinDefault(contouredValue.sharedContourSettings.initialValueSetting, contouredValueState.initialValue);
  updateSettingWithMinDefault(contouredValue.sharedContourSettings.firstStageTimeSetting, contouredValueState.attackTime);
  updateSettingWithMinDefault(contouredValue.sharedContourSettings.numStagesSetting, contouredValueState.numStages);
  for (var i = 0; i < AudioConstants.kMaxIntermediateStageValues; i++) {
    updateIntermediateContourStage(contouredValue.sharedContourSettings.intermediateStages,
                                   contouredValueState.intermediateStages,
                                   i);
  }
  updateSettingWithMinDefault(contouredValue.sharedContourSettings.releaseTimeSetting, contouredValueState.releaseTime);
  updateSettingWithMinDefault(contouredValue.sharedContourSettings.finalValueSetting, contouredValueState.finalValue);
  updateSettingWithMidDefault(contouredValue.sharedContourSettings.oscillationAmountSetting, contouredValueState.oscillationAmount);
  updateSetting(contouredValue.sharedContourSettings.oscillationWaveSetting, contouredValueState.oscillationWave, AudioConstants.kSineWave);
  updateSettingWithMaxDefault(contouredValue.sharedContourSettings.oscillationMaxValueSetting, contouredValueState.oscillationMaxValue);
  updateSettingWithMinDefault(contouredValue.sharedContourSettings.oscillationMinValueSetting, contouredValueState.oscillationMinValue);
  updateSettingWithRatioedDefault(contouredValue.sharedContourSettings.oscillationFrequencySetting, contouredValueState.oscillationFrequency, 0.02);
  updateSettingWithRatioedDefault(contouredValue.sharedContourSettings.oscillationTimeConstantSetting, contouredValueState.oscillationTimeConstant, 0.05);
  updateSetting(contouredValue.sharedContourSettings.oscillationTypeSetting, contouredValueState.oscillationType, AudioConstants.kConstantOscillation);
  updateSetting(contouredValue.sharedContourSettings.sweepTimeSetting, contouredValueState.sweepTimeSetting, 1);
}

function getContouredValueState(contouredValue) {
  var contouredValueState = {};

  contouredValueState.currentContour = contouredValue.currentContourSetting.value;
  contouredValueState.initialValue = contouredValue.sharedContourSettings.initialValueSetting.value;
  contouredValueState.attackTime = contouredValue.sharedContourSettings.firstStageTimeSetting.value;
  contouredValueState.numStages = contouredValue.sharedContourSettings.numStagesSetting.value;
  contouredValueState.intermediateStages = [];
  for (var i = 0; i < AudioConstants.kMaxIntermediateStageValues; i++)
    contouredValueState.intermediateStages.push(getIntermediateContourStageState(contouredValue.sharedContourSettings.intermediateStages[i]));
  contouredValueState.releaseTime = contouredValue.sharedContourSettings.releaseTimeSetting.value;
  contouredValueState.finalValue = contouredValue.sharedContourSettings.finalValueSetting.value;
  contouredValueState.oscillationAmount = contouredValue.sharedContourSettings.oscillationAmountSetting.value;
  contouredValueState.oscillationWave = contouredValue.sharedContourSettings.oscillationWaveSetting.value;
  contouredValueState.oscillationMaxValue = contouredValue.sharedContourSettings.oscillationMaxValueSetting.value;
  contouredValueState.oscillationMinValue = contouredValue.sharedContourSettings.oscillationMinValueSetting.value;
  contouredValueState.oscillationFrequency = contouredValue.sharedContourSettings.oscillationFrequencySetting.value;
  contouredValueState.oscillationTimeConstant = contouredValue.sharedContourSettings.oscillationTimeConstantSetting.value;
  contouredValueState.oscillationType = contouredValue.sharedContourSettings.oscillationTypeSetting.value;
  contouredValueState.sweepTimeSetting = contouredValue.sharedContourSettings.sweepTimeSetting.value;

  return contouredValueState;
}

function updateFilter(filter, filterState) {
  if (!filterState) {
    filterState = {};
  }
  updateSetting(filter.enabledSetting, filterState.enabled, false);
  updateSetting(filter.typeSetting, filterState.type, filter.typeSetting.choices[0]);
  updateSetting(filter.orderSetting, filterState.order, filter.orderSetting.choices[0]);
  updateSettingWithMinDefault(filter.qSetting, filterState.q);
  updateContouredValue(filter.frequencyContour, filterState.frequency);
}

function getFilterState(filter) {
  var filterState = {};

  filterState.enabled = filter.enabledSetting.value;
  filterState.type = filter.typeSetting.value;
  filterState.order = filter.orderSetting.value;
  filterState.q = filter.qSetting.value;
  filterState.frequency = getContouredValueState(filter.frequencyContour);

  return filterState;
}

function updateOscillator(oscillator, oscillatorState) {
  if (!oscillatorState) {
    oscillatorState = {};
  }
  updateSetting(oscillator.enabledSetting, oscillatorState.enabled, false);
  updateSetting(oscillator.typeSetting, oscillatorState.type, AudioConstants.kSawtoothWave);
  updateSetting(oscillator.octaveOffsetSetting, oscillatorState.octaveOffset, 0);
  updateSetting(oscillator.noteOffsetSetting, oscillatorState.noteOffset, 0);
  updateSetting(oscillator.detuneSetting, oscillatorState.detune, 0);
  updateContouredValue(oscillator.gainContour, oscillatorState.gain);
}

function getOscillatorState(oscillator) {
  var oscillatorState = {};

  oscillatorState.enabled = oscillator.enabledSetting.value;
  oscillatorState.type = oscillator.typeSetting.value;
  oscillatorState.octaveOffset = oscillator.octaveOffsetSetting.value;
  oscillatorState.noteOffset = oscillator.noteOffsetSetting.value;
  oscillatorState.detune = oscillator.detuneSetting.value;
  oscillatorState.gain = getContouredValueState(oscillator.gainContour);

  return oscillatorState;
}

function updatePitch(pitch, pitchState){
  if (!pitchState) {
    pitchState = {};
  }
  updateSetting(pitch.unitsSetting, pitchState.units, AudioConstants.kSemitones);
  updateContouredValue(pitch.contour, pitchState.contour);
}

function getPitchState(pitch) {
  var pitchState = {};

  pitchState.units = pitch.unitsSetting.value;
  pitchState.contour = getContouredValueState(pitch.contour);

  return pitchState;
}

module.updateInstrument = function(instrument, instrumentState) {
  if (!instrumentState) {
    reportError('instrumentState undefined');
    return;
  }
  updatePitch(instrument.pitch, instrumentState.pitch);
  for (var i = 0; i < instrument.oscillators.length; i++) {
    updateOscillator(instrument.oscillators[i], instrumentState.oscillators[i]);
  }
  for (var i = 0; i < instrument.filters.length; i++) {
    updateFilter(instrument.filters[i], instrumentState.filters[i]);
  }
  updateContouredValue(instrument.envelopeContour, instrumentState.envelope);
}

module.getInstrumentState = function(instrument) {
  var instrumentState = {};

  instrumentState.pitch = getPitchState(instrument.pitch);
  instrumentState.oscillators = [];
  for (var i = 0; i < instrument.oscillators.length; i++) {
    instrumentState.oscillators.push(getOscillatorState(instrument.oscillators[i]));
  }
  instrumentState.filters = [];
  for (var i = 0; i < instrument.filters.length; i++) {
    instrumentState.filters.push(getFilterState(instrument.filters[i]));
  }
  instrumentState.envelope = getContouredValueState(instrument.envelopeContour)

  return instrumentState;
}

return module;

})();