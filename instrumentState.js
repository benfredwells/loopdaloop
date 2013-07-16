InstrumentState = (function() {

"use strict";

var module = {};

module.updateOscillator = function(oscillator, oscillatorState) {
  oscillator.typeSetting.value = oscillatorState.type;
}

module.updateInstrument = function(instrument, instrumentState) {
  for (var i = 0; i < instrumentState.oscillatorStates.length; i++) {
  	module.updateOscillator(instrument.oscillators[i], instrumentState.oscillatorStates[i]);
  }
}

return module;

})();