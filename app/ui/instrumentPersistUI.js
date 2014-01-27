InstrumentPersistUI = (function() {

"use strict"

var module = {};

module.UI = function(parentDiv, instrument, onchange) {
  UI.Control.call(this, parentDiv);

  this.instrument_ = instrument;
  this.savedInstruments_ = null;
  this.onchange = onchange;

  this.select = document.createElement('select');
  this.select.classList.add('instrumentSelect');
  this.div.appendChild(this.select);
  var option = document.createElement('option');
  option.text = Strings.kLoading;
  this.select.add(option);

  var ui = this;
  this.select.onchange = function() {ui.updateInstrument_()};
  var save = function(event) {ui.save_(event)};
  (new UI.Button(this.div, save, Strings.kSave)).div.id = 'saveButton';
  (new UI.Button(this.div, null, Strings.kSaveAs)).div.id = 'saveAsButton';
}

module.UI.prototype = Object.create(UI.Control.prototype);

module.UI.prototype.save_ = function(event) {
  var instrumentState = InstrumentState.getInstrumentState(this.instrument_);
  console.log(JSON.stringify(instrumentState, null, 2));
}

module.UI.prototype.updateInstrument_ = function() {
  var savedInstrument = this.savedInstruments_.presets[this.select.value];
  InstrumentState.updateInstrument(this.instrument_, savedInstrument.instrumentState);
  if (this.onchange)
    this.onchange();
}

module.UI.prototype.initialize = function(savedInstruments) {
  this.savedInstruments_ = savedInstruments;
  while(this.select.options.length)
    this.select.remove(0);

  for (var i = 0; i < this.savedInstruments_.presets.length; i++) {
    var option = document.createElement('option');
    option.value = i;
    option.text = this.savedInstruments_.presets[i].name;
    this.select.add(option, null);
  }
}

return module;

})();