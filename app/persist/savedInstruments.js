"use strict";

var SavedInstruments = (function() {

var module = {};

var kSaverTimerInterval = 5000;

var Preset = function(originalEntry) {
  this.name = '';
  this.isDefault = false;
  this.modified = false;
  this.instrumentState = null;
  this.originalEntry = originalEntry;
};

Preset.prototype.updateInstrument_ = function(instrument) {
  instrument.stopListening();
  InstrumentState.updateInstrument(instrument, this.instrumentState);
  instrument.startListening();
};

Preset.prototype.updateFromInstrument_ = function(instrument) {
  this.instrumentState = InstrumentState.getInstrumentState(instrument);
};

Preset.prototype.updateFromJSON = function(then, jsonText) {
  var fromJSON = JSON.parse(jsonText);
  this.name = fromJSON.name;
  this.instrumentState = fromJSON.instrumentState;
  this.isDefault = fromJSON.default;
  then();
};

Preset.prototype.loadFromOriginal = function(then) {
  this.instrumentState = null;
  FileUtil.readFile(this.originalEntry, this.updateFromJSON.bind(this, then));
};

module.Manager = function(instrument, onInstrumentsLoaded) {
  this.instrument_ = instrument;
  this.presets = [];
  this.loaded = false;
  this.currentPreset = null;
  this.onInstrumentsLoaded = onInstrumentsLoaded;
  this.onPresetStateChanged = null;
  this.instrument_.setListener(this);
  this.loadPresets();
  this.saveTimerId = null;
};

module.Manager.prototype.loadPresets = function() {
  var manager = this;
  chrome.runtime.getPackageDirectoryEntry(function(packageEntry) {
    packageEntry.getDirectory('presets', {create: false}, function(presetsEntry) {
      var processEntry = function(entry, then) {
        var preset = new Preset(entry);
        manager.presets.push(preset);
        preset.loadFromOriginal(then);
      };

      FileUtil.forEachEntry(presetsEntry, processEntry, manager.handlePresetsLoaded.bind(manager));
    });
  });
};

module.Manager.prototype.handlePresetsLoaded = function() {
  var manager = this;
  this.presets.forEach(function(preset) {
    if (preset.isDefault)
      manager.usePreset(preset);
  });

  this.loaded = true;
  this.instrument_.startListening();
  this.onInstrumentsLoaded();
};

module.Manager.prototype.usePresetWithIndex = function(index) {
  this.usePreset(this.presets[index]);
};

module.Manager.prototype.usePreset = function(preset) {
  if (this.currentPreset)
    this.currentPreset.updateFromInstrument_(this.instrument_);

  this.currentPreset = preset;
  this.currentPreset.updateInstrument_(this.instrument_);
};

module.Manager.prototype.export = function(instrument) {
  var jsonObject = {};
  jsonObject.instrumentState = InstrumentState.getInstrumentState(instrument);
  var jsonText = JSON.stringify(jsonObject, null, 2);
  chrome.fileSystem.chooseEntry({type: 'saveFile'}, function(entry) {
    FileUtil.writeFile(entry, jsonText);
  });
};

module.Manager.prototype.onChanged = function() {
  this.currentPreset.modified = true;
  this.scheduleSave_();
  if (this.onPresetStateChanged)
    this.onPresetStateChanged();
};

module.Manager.prototype.scheduleSave_ = function() {
  if (this.saveTimerId)
    clearTimeout(this.saveTimerId);
  
  this.saveTimerId = setTimeout(this.doSave_.bind(this), kSaverTimerInterval);
};

module.Manager.prototype.doSave_ = function() {
  console.log('Saved!');
  this.saveTimerId = null;
};

return module;

})();