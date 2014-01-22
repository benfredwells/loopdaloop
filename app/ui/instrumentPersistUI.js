InstrumentPersistUI = (function() {

"use strict"

var module = {};

module.UI = function(buttonEl, instrument) {
  this.instrument_ = instrument;
  var button = this;
  buttonEl.onclick = function(event) { button.buttonClick(event); };
}

module.UI.prototype.buttonClick = function(event) {
  var instrumentState = InstrumentState.getInstrumentState(this.instrument_);
  console.log(JSON.stringify(instrumentState, null, 2));
}

return module;

})();