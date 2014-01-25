InstrumentPersistUI = (function() {

"use strict"

var module = {};

module.UI = function(parentDiv, instrument, savedInstruments) {
  UI.Control.call(this, parentDiv);

  this.instrument_ = instrument;
  this.savedInstruments_ = savedInstruments;

  this.select = document.createElement('select');
  this.select.classList.add('instrumentSelect');
  this.div.appendChild(this.select);
  for (var i = 0; i < this.savedInstruments_.presets.length; i++) {
    var option = document.createElement('option');
    option.value = this.savedInstruments_.presets[i];
    option.text = this.savedInstruments_.presets[i].name;
    this.select.add(option, null);
  }

/*  var row = this;
  this.select.onchange = function() {
    choiceSetting.value = row.select.value;
    if (row.onchange)
      row.onchange();
  }*/

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