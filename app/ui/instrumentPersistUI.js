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
  (new UI.Button(this.div, save, Strings.kExport)).div.id = 'exportButton';

  this.select.disabled = true;
};

module.UI.prototype = Object.create(UI.Control.prototype);

module.UI.prototype.save_ = function(event) {
  var ui = this;
  chrome.fileSystem.chooseEntry({type: 'saveFile'}, function(entry) {
    ui.savedInstruments_.exportCurrent(entry);
  });
};

module.UI.prototype.updateInstrument_ = function() {
  this.savedInstruments_.usePresetWithIndex(this.select.value);
  if (this.onchange)
    this.onchange();
};

module.UI.prototype.initialize = function(savedInstruments) {
  this.savedInstruments_ = savedInstruments;
  this.savedInstruments_.onPresetStateChanged = this.handlePresetStateChanged.bind(this);
  while(this.select.options.length)
    this.select.remove(0);
  this.select.disabled = false;

  for (var i = 0; i < this.savedInstruments_.presets.length; i++) {
    var option = document.createElement('option');
    option.value = i;
    option.preset = this.savedInstruments_.presets[i];
    option.text = option.preset.name;
    this.select.add(option, null);
    if (option.preset == this.savedInstruments_.currentPreset)
      this.select.value = i;
  }
};

module.UI.prototype.handlePresetStateChanged = function() {
  var ui = this;
  for (var i = 0; i < this.select.options.length; i++) {
    var option = this.select.options[i];
    var suffix = '';
    if (option.preset.isModified)
      suffix = ' (dirty)';
      
    if (option.preset.isSaving)
      suffix = suffix + ' (saving)';

    option.text = option.preset.name + suffix;
  }
};

return module;

})();