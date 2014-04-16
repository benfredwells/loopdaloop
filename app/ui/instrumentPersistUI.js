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

  this.chooseNameDialog_ = new Dialog.EnterTextDialog('Enter Name');

  var ui = this;
  this.select.onchange = function() {ui.updateInstrument_()};

  var doAdd = function(event) {ui.add_(event)};
  (new UI.Button(this.div, doAdd, Strings.kAdd)).div.classList.add('persistButton');

  (new UI.Button(this.div, null, Strings.kClear)).div.classList.add('persistButton');

  var doExport = function(event) {ui.export_(event)};
  (new UI.Button(this.div, doExport, Strings.kExport)).div.classList.add('persistButton');

  this.select.disabled = true;
};

module.UI.prototype = Object.create(UI.Control.prototype);

module.UI.prototype.save_ = function(event) {
  var ui = this;
  chrome.fileSystem.chooseEntry({type: 'saveFile'}, function(entry) {
    ui.savedInstruments_.exportCurrent(entry);
  });
};

module.UI.prototype.handleNameChosen_ = function(name) {
  this.savedInstruments_.addUserPreset(name);
}

module.UI.prototype.add_ = function(event) {
  this.chooseNameDialog_.show(this.handleNameChosen_.bind(this));
}

module.UI.prototype.updateInstrument_ = function() {
  this.savedInstruments_.usePresetWithIndex(this.select.value);
  if (this.onchange)
    this.onchange();
};

module.UI.prototype.initialize = function(savedInstruments) {
  this.savedInstruments_ = savedInstruments;
  this.savedInstruments_.onCurrentPresetModified = this.handleCurrentPresetModified.bind(this);
  this.savedInstruments_.onPresetListChanged = this.handlePresetListChanged.bind(this);
  this.populateSelect_();
  this.select.disabled = false;
};

module.UI.prototype.populateSelect_ = function() {
  while(this.select.options.length)
    this.select.remove(0);

  for (var i = 0; i < this.savedInstruments_.presets.length; i++) {
    var option = document.createElement('option');
    option.value = i;
    option.preset = this.savedInstruments_.presets[i];
    option.text = option.preset.name;
    this.select.add(option, null);
    if (option.preset == this.savedInstruments_.currentPreset)
      this.select.value = i;
  }
}

module.UI.prototype.updateSelectIndex_ = function() {
  for (var i = 0; i < this.select.options.length; i++) {
    var option = this.select[i];
    if (option.preset == this.savedInstruments_.currentPreset)
      this.select.value = i;
  }
  if (this.onchange)
    this.onchange();
}

module.UI.prototype.useNamedPreset = function(name) {
  this.savedInstruments_.usePresetWithFileName(name);
  this.updateSelectIndex_();
};

module.UI.prototype.getCurrentPresetName = function() {
  if (!this.savedInstruments_.currentPreset)
    return '';

  return this.savedInstruments_.currentPreset.fileName;
};

module.UI.prototype.handleCurrentPresetModified = function() {
  if (this.onchange)
    this.onchange();
};

module.UI.prototype.handlePresetListChanged = function() {
  this.populateSelect_();
  if (this.onchange)
    this.onchange();
}

return module;

})();