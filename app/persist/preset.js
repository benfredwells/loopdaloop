"use strict";

var Preset = (function() {

var module = {};

var Preset = function(manager, name, fileName, storageDirectoryEntry) {
  this.name = name;
  this.manager_ = manager;
  this.isDefault = false;
  this.isModified = false;
  this.isSaving = false;
  this.instrumentState = null;
  this.storageDirectoryEntry = storageDirectoryEntry;
  this.fileName = fileName;
};

Preset.prototype.updateInstrument = function(instrument) {
  instrument.stopListening();
  InstrumentState.updateInstrument(instrument, this.instrumentState);
  instrument.startListening();
};

Preset.prototype.updateFromInstrument = function(instrument) {
  this.instrumentState = InstrumentState.getInstrumentState(instrument);
};

Preset.prototype.updateFromJSON_ = function(then, jsonText) {
  var fromJSON = JSON.parse(jsonText);
  this.name = fromJSON.name;
  this.instrumentState = fromJSON.instrumentState;
  this.isDefault = fromJSON.default;
  then();
};

Preset.prototype.loadFromEntry = function(then, entry) {
  this.instrumentState = null;
  FileUtil.readFile(entry, this.updateFromJSON_.bind(this, then), this.manager_.domErrorHandlerCallback);
};

Preset.prototype.loadFromOriginal_ = function(then) {
  // by default do nothing. Only builtins have original state.
}

Preset.prototype.load = function(then) {
  if (this.storageDirectoryEntry) {
    this.storageDirectoryEntry.getFile(this.fileName, {create: false}, this.loadFromEntry.bind(this, then),
                                       this.loadFromOriginal_.bind(this, then),
                                       this.manager_.domErrorHandlerCallback);
  }
  else
    this.loadFromOriginal_(then);
}

Preset.prototype.beginSaveIfNeeded = function() {
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

Preset.prototype.finishedSaving_ = function() {
  console.log('Finished saving preset ' + this.fileName);
  this.isSaving = false;
};

module.BuiltIn = function(manager, originalFileEntry, storageDirectoryEntry) {
  Preset.call(this, manager, '', originalFileEntry.name, storageDirectoryEntry);
  this.originalFileEntry_ = originalFileEntry;
};

module.BuiltIn.prototype = Object.create(Preset.prototype);

module.BuiltIn.prototype.loadFromOriginal_ = function(then) {
  this.loadFromEntry(then, this.originalFileEntry_);
};

return module;

})();