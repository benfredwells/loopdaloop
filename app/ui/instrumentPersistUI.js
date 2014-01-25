InstrumentPersistUI = (function() {

"use strict"

var module = {};

module.UI = function(parentDiv, instrument) {
  UI.Control.call(this, parentDiv);

  this.instrument_ = instrument;

  var ui = this;
  var save = function(event) {ui.save(event)};
  (new UI.Button(this.div, save, Strings.kSave)).div.id = 'saveButton';
  (new UI.Button(this.div, null, Strings.kSaveAs)).div.id = 'saveAsButton';
}

module.UI.prototype = Object.create(UI.Control.prototype);

module.UI.prototype.save = function(event) {
  var instrumentState = InstrumentState.getInstrumentState(this.instrument_);
  console.log(JSON.stringify(instrumentState, null, 2));
}

return module;

})();