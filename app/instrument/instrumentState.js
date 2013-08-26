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

module.updateFlatContour = function(flatContour, flatContourState) {
  if (!flatContourState) {
    flatContourState = {};
  }
  updateSettingWithMaxDefault(flatContour.valueSetting, flatContourState.value);
}

module.updateOscillatingContour = function(oscillatingContour, oscillatingContourState) {
  if (!oscillatingContourState) {
    oscillatingContourState = {};
  }
  var o = oscillatingContour;
  updateSettingWithMidDefault(o.maxValueSetting, oscillatingContourState.maxValue);
  updateSettingWithMidDefault(o.minValueSetting, oscillatingContourState.minValue);
  updateSettingWithMinDefault(o.frequencySetting, oscillatingContourState.frequency);
}

module.updateADSRContour = function(adsrContour, adsrContourState) {
  if (!adsrContourState) {
    adsrContourState = {};
  }
  updateSettingWithMinDefault(adsrContour.initialValueSetting, adsrContourState.initialValue);
  updateSettingWithMinDefault(adsrContour.attackDelaySetting, adsrContourState.attackDelay);
  updateSettingWithMinDefault(adsrContour.attackTimeSetting, adsrContourState.attackTime);
  updateSettingWithMaxDefault(adsrContour.attackValueSetting, adsrContourState.attackValue);
  updateSettingWithMinDefault(adsrContour.attackHoldSetting, adsrContourState.attackHold);
  updateSettingWithMinDefault(adsrContour.decayTimeSetting, adsrContourState.decayTime);
  updateSettingWithMidDefault(adsrContour.sustainValueSetting, adsrContourState.sustainValue);
  updateSettingWithMinDefault(adsrContour.sustainHoldSetting, adsrContourState.sustainHold);
  updateSettingWithMinDefault(adsrContour.releaseTimeSetting, adsrContourState.releaseTime);
  updateSettingWithMinDefault(adsrContour.finalValueSetting, adsrContourState.finalValue);
}

module.updateContouredValue = function(contouredValue, contouredValueState) {
  if (!contouredValueState) {
    contouredValueState = {};
    contouredValueState.contours = {};
  }
  updateSetting(contouredValue.currentContourSetting, contouredValueState.currentContour, Contour.kFlatContour);
  module.updateFlatContour(contouredValue.contoursByIdentifier[Contour.kFlatContour],
                           contouredValueState.contours[Contour.kFlatContour]);
  module.updateOscillatingContour(contouredValue.contoursByIdentifier[Contour.kOscillatingContour],
                                  contouredValueState.contours[Contour.kOscillatingContour]);
  module.updateADSRContour(contouredValue.contoursByIdentifier[Contour.kADSRContour],
                           contouredValueState.contours[Contour.kADSRContour]);
}

module.updateFilter = function(filter, filterState) {
  if (!filterState) {
    filterState = {};
  }
  updateSetting(filter.enabledSetting, filterState.enabled, false);
  updateSetting(filter.typeSetting, filterState.type, filter.typeSetting.choices[0]);
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

module.updateDisplaySettings = function(displaySettings, displaySettingsState) {
  if (!displaySettingsState) {
    displaySettingsState = {};
  }
  updateSetting(displaySettings.noteOnTimeSetting, displaySettingsState.noteOnTime, 1);
  updateSetting(displaySettings.releaseTimeSetting, displaySettingsState.releaseTime, 1);
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
  module.updateDisplaySettings(instrument.displaySettings, instrumentState.displaySettings);
}

return module;

})();