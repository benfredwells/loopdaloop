SavedInstruments = (function() {

"use strict";

var module = {};

var Preset = function(originalEntry, localFolder) {
  this.name = '';
  this.isDefault = false;
  this.instrumentState = null;
  this.originalEntry = originalEntry;
  this.localFolder = localFolder;
};

Preset.prototype.updateInstrument = function(instrument) {
  InstrumentState.updateInstrument(instrument, this.instrumentState);
  instrument.clearModified();
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

module.Manager = function(onInstrumentsLoaded) {
  this.default = null;
  this.presets = [];
  this.loaded = false;
  this.onInstrumentsLoaded = onInstrumentsLoaded;
  this.loadPresets();
};

module.Manager.prototype.loadPresets = function() {
  var manager = this;
  chrome.runtime.getPackageDirectoryEntry(function(packageEntry) {
    packageEntry.getDirectory('presets', {create: false}, function(presetsEntry) {
      var processEntry = function(entry, then) {
        var preset = new Preset(entry, null);
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
      manager.default = preset;
  });

  this.loaded = true;
  this.onInstrumentsLoaded();
};

module.Manager.prototype.export = function(instrument) {
  var jsonObject = {};
  jsonObject.instrumentState = InstrumentState.getInstrumentState(instrument);
  var jsonText = JSON.stringify(jsonObject, null, 2);
  chrome.fileSystem.chooseEntry({type: 'saveFile'}, function(entry) {
    FileUtil.writeFile(entry, jsonText);
  });
};

return module;

})();