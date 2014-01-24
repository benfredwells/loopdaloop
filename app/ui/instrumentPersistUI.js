InstrumentPersistUI = (function() {

"use strict"

var module = {};

module.UI = function(parentDiv, instrument) {
  UI.Control.call(this, parentDiv);

  this.instrument_ = instrument;
  (new UI.Button(this.div, this.buttonClick, Strings.kSave)).div.id = 'saveButton';
  (new UI.Button(this.div, null, Strings.kSaveAs)).div.id = 'saveAsButton';
}

module.UI.prototype = Object.create(UI.Control.prototype);

module.UI.prototype.buttonClick = function(event) {
  var instrumentState = InstrumentState.getInstrumentState(this.instrument_);
  console.log(JSON.stringify(instrumentState, null, 2));
}

return module;

})();