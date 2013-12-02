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

module.updateIntermediateContourStage = function(intermediateStages, intermediateStageStates, index) {
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

// Uses the same state holder as the contoured value, as the seperation is more design
// than the normalized structure.
module.updateSharedContourSettings = function(sharedSettings, contouredValueState) {
  updateSettingWithMinDefault(sharedSettings.initialValueSetting, contouredValueState.initialValue);
  updateSettingWithMinDefault(sharedSettings.firstStageTimeSetting, contouredValueState.attackTime);
  updateSettingWithMinDefault(sharedSettings.numStagesSetting, contouredValueState.numStages);
  for (var i = 0; i < Contour.kMaxIntermediateStages; i++) {
    module.updateIntermediateContourStage(sharedSettings.intermediateStages,
                                          contouredValueState.intermediateStages,
                                          i);
  }
  updateSettingWithMidDefault(sharedSettings.sustainValueSetting, contouredValueState.sustainValue);
  updateSettingWithMinDefault(sharedSettings.releaseTimeSetting, contouredValueState.releaseTime);
  updateSettingWithMinDefault(sharedSettings.finalValueSetting, contouredValueState.finalValue);
  updateSettingWithMidDefault(sharedSettings.oscillationAmountSetting, contouredValueState.oscillationAmount);
  updateSetting(sharedSettings.oscillationTypeSetting, contouredValueState.oscillationType, AudioConstants.kSineWave);
  updateSettingWithMaxDefault(sharedSettings.oscillationMaxValueSetting, contouredValueState.oscillationMaxValue);
  updateSettingWithMinDefault(sharedSettings.oscillationMinValueSetting, contouredValueState.oscillationMinValue);
  updateSettingWithRatioedDefault(sharedSettings.oscillationFrequencySetting, contouredValueState.oscillationFrequency, 0.02);
  updateSettingWithRatioedDefault(sharedSettings.oscillationTimeConstantSetting, contouredValueState.oscillationTimeConstant, 0.05);
}

module.updateContouredValue = function(contouredValue, contouredValueState) {
  if (!contouredValueState) {
    contouredValueState = {};
    contouredValueState.contours = {};
  }
  updateSetting(contouredValue.currentContourSetting, contouredValueState.currentContour, Contour.kFlatContour);
  module.updateSharedContourSettings(contouredValue.sharedContourSettings, contouredValueState);
}

module.updateFilter = function(filter, filterState) {
  if (!filterState) {
    filterState = {};
  }
  updateSetting(filter.enabledSetting, filterState.enabled, false);
  updateSetting(filter.typeSetting, filterState.type, filter.typeSetting.choices[0]);
  updateSetting(filter.orderSetting, filterState.order, filter.orderSetting.choices[0]);
  updateSettingWithMinDefault(filter.qSetting, filterState.q);
  module.updateContouredValue(filter.frequencyContour, filterState.frequency);
}

module.updateOscillator = function(oscillator, oscillatorState) {
  if (!oscillatorState) {
    oscillatorState = {};
  }
  updateSetting(oscillator.enabledSetting, oscillatorState.enabled, false);
  updateSetting(oscillator.typeSetting, oscillatorState.type, oscillator.typeSetting.choices[0]);
  updateSetting(oscillator.octaveOffsetSetting, oscillatorState.octaveOffset, 0);
  updateSetting(oscillator.noteOffsetSetting, oscillatorState.noteOffset, 0);
  updateSetting(oscillator.detuneSetting, oscillatorState.detune, 0);
  module.updateContouredValue(oscillator.gainContour, oscillatorState.gain);
}

module.updateInstrument = function(instrument, instrumentState) {
  if (!instrumentState) {
    reportError('instrumentState undefined');
    return;
  }
  for (var i = 0; i < instrumentState.oscillators.length; i++) {
    module.updateOscillator(instrument.oscillators[i], instrumentState.oscillators[i]);
  }
  for (var i = 0; i < instrumentState.filters.length; i++) {
    module.updateFilter(instrument.filters[i], instrumentState.filters[i]);
  }
  module.updateContouredValue(instrument.envelopeContour, instrumentState.envelope);
}

return module;

})();