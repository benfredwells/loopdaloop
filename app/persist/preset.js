"use strict";

var Preset = (function() {

var kPresetSuffix = '.preset';

var module = {};

module.Preset = function(manager, originalFileEntry, storageDirectoryEntry) {
  this.name = '';
  this.manager_ = manager;
  this.isDefault = false;
  this.isModified = false;
  this.isSaving = false;
  this.instrumentState = null;
  this.originalFileEntry_ = originalFileEntry;
  this.storageDirectoryEntry = storageDirectoryEntry;
  this.fileName = this.originalFileEntry_.name + kPresetSuffix;
};

module.Preset.prototype.updateInstrument = function(instrument) {
  instrument.stopListening();
  InstrumentState.updateInstrument(instrument, this.instrumentState);
  instrument.startListening();
};

module.Preset.prototype.updateFromInstrument = function(instrument) {
  this.instrumentState = InstrumentState.getInstrumentState(instrument);
};

module.Preset.prototype.updateFromJSON_ = function(then, jsonText) {
  var fromJSON = JSON.parse(jsonText);
  this.name = fromJSON.name;
  this.instrumentState = fromJSON.instrumentState;
  this.isDefault = fromJSON.default;
  then();
};

module.Preset.prototype.loadFromEntry = function(then, entry) {

  this.instrumentState = null;
  FileUtil.readFile(entry, this.updateFromJSON_.bind(this, then), this.manager_.domErrorHandlerCallback);
};

module.Preset.prototype.load = function(then) {
  if (this.storageDirectoryEntry) {
    this.storageDirectoryEntry.getFile(this.fileName, {create: false}, this.loadFromEntry.bind(this, then),
                                       this.loadFromEntry.bind(this, then, this.originalFileEntry_),
                                       this.manager_.domErrorHandlerCallback);
  }
  else
    this.loadFromEntry(entry, this.originalFileEntry_);
}

module.Preset.prototype.beginSaveIfNeeded = function() {
  if (!this.isModified)
    return;

  console.log('Saving preset ' + this.fileName);

  this.isModified = false;
  if (!this.storageDirectoryEntry)
    return;

  this.isSaving = true;
  var jsonObject = {};
  jsonObject.instrumentState = this.instrumentState;
  jsonObject.default = this.isDefault;
  jsonObject.name = this.name;
  var jsonText = JSON.stringify(jsonObject, null, 2);
  var preset = this;
  this.storageDirectoryEntry.getFile(this.fileName, {create: true}, function(entry) {
    FileUtil.writeFile(entry, jsonText, preset.finishedSaving_.bind(preset), preset.manager_.domErrorHandlerCallback);
  }, this.manager_.domErrorHandlerCallback);
};

module.Preset.prototype.finishedSaving_ = function() {
  console.log('Finished saving preset ' + this.fileName);
  this.isSaving = false;
};

return module;

})();