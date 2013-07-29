InstrumentState = (function() {

"use strict";

var module = {};

function reportError(error) {
  console.log(error);
  console.trace();
}

function updateSetting(setting, value) {
  if (value != null)
    setting.value = value;
  else
    reportError('updateSetting error: no value');
}

module.updateFlatContour = function(flatContour, flatContourState) {
  if (!flatContourState) {
    reportError('flatContourState undefined');
    return;
  }
  updateSetting(flatContour.valueSetting, flatContourState.value);
}

module.updateOscillatingContour = function(oscillatingContour, oscillatingContourState) {
  if (!oscillatingContourState) {
    reportError('oscillatingContourState undefined');
    return;
  }
  updateSetting(oscillatingContour.centerValueSetting, oscillatingContourState.centerValue);
  updateSetting(oscillatingContour.amplitudeSetting, oscillatingContourState.amplitude);
  updateSetting(oscillatingContour.frequencySetting, oscillatingContourState.frequency);
}

module.updateADSRContour = function(adsrContour, adsrContourState) {
  if (!adsrContourState) {
    reportError('adsrContourState undefined');
    return;
  }
  updateSetting(adsrContour.initialValueSetting, adsrContourState.initialValue);
  updateSetting(adsrContour.attackDelaySetting, adsrContourState.attackDelay);
  updateSetting(adsrContour.attackTimeSetting, adsrContourState.attackTime);
  updateSetting(adsrContour.attackValueSetting, adsrContourState.attackValue);
  updateSetting(adsrContour.attackHoldSetting, adsrContourState.attackHold);
  updateSetting(adsrContour.decayTimeSetting, adsrContourState.decayTime);
  updateSetting(adsrContour.sustainValueSetting, adsrContourState.sustainValue);
  updateSetting(adsrContour.sustainHoldSetting, adsrContourState.sustainHold);
  updateSetting(adsrContour.releaseTimeSetting, adsrContourState.releaseTime);
  updateSetting(adsrContour.finalValueSetting, adsrContourState.finalValue);
}

module.updateContouredValue = function(contouredValue, contouredValueState) {
  if (!contouredValueState) {
    reportError('contouredValueState undefined');
    return;
  }
  updateSetting(contouredValue.currentContourSetting, contouredValueState.currentContour);
  module.updateFlatContour(contouredValue.contoursByIdentifier[Contour.kFlatContour],
                           contouredValueState.contours[Contour.kFlatContour]);
  module.updateOscillatingContour(contouredValue.contoursByIdentifier[Contour.kOscillatingContour],
                                  contouredValueState.contours[Contour.kOscillatingContour]);
  module.updateADSRContour(contouredValue.contoursByIdentifier[Contour.kADSRContour],
                           contouredValueState.contours[Contour.kADSRContour]);
}

module.updateFilter = function(filter, filterState) {
  if (!filterState) {
    reportError('filterState undefined');
    return;
  }
  updateSetting(filter.enabledSetting, filterState.enabled);
  updateSetting(filter.typeSetting, filterState.type);
  updateSetting(filter.qSetting, filterState.q);
  module.updateContouredValue(filter.frequencyContour, filterState.frequency);
}

module.updateOscillator = function(oscillator, oscillatorState) {
  if (!oscillatorState) {
    reportError('oscillatorState undefined');
    return;
  }
  updateSetting(oscillator.enabledSetting, oscillatorState.enabled);
  updateSetting(oscillator.typeSetting, oscillatorState.type);
  updateSetting(oscillator.octaveOffsetSetting, oscillatorState.octaveOffset);
  updateSetting(oscillator.noteOffsetSetting, oscillatorState.noteOffset);
  updateSetting(oscillator.detuneSetting, oscillatorState.detune);
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
  module.updateContouredValue(instrument.envelopeContour, instrumentState.envelope)
}

return module;

})();