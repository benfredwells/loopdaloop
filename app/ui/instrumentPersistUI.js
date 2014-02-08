"use strict";

var InstrumentPersistUI = (function() {

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

  this.select.disabled = true;
};

module.UI.prototype = Object.create(UI.Control.prototype);

module.UI.prototype.save_ = function(event) {
  this.savedInstruments_.export(this.instrument_);
};

module.UI.prototype.updateInstrument_ = function() {
  this.savedInstruments_.usePreset(this.select.value);
  if (this.onchange)
    this.onchange();
};

module.UI.prototype.initialize = function(savedInstruments) {
  this.instrument_.setListener(this);
  this.savedInstruments_ = savedInstruments;
  while(this.select.options.length)
    this.select.remove(0);
  this.select.disabled = false;

  for (var i = 0; i < this.savedInstruments_.presets.length; i++) {
    var option = document.createElement('option');
    option.value = i;
    option.text = this.savedInstruments_.presets[i].name;
    this.select.add(option, null);
    if (this.savedInstruments_.presets[i] == this.savedInstruments_.currentPreset)
      this.select.value = i;
  }
};

module.UI.prototype.onModifiedChanged = function() {
/*
  var suffix = '';
  if (this.instrument_.isModified())
    suffix = ' *';

  this.select.options[this.select.value].text = this.current_().name + suffix;
*/
};

return module;

})();