SavedInstruments = (function() {

"use strict"

var module = {}

var SavedInstrument = function(name, isPreset, instrumentState) {
  this.name = name;
  this.isPreset = isPreset;
  this.instrumentState = instrumentState;
}

SavedInstrument.prototype.updateInstrument = function(instrument) {
  InstrumentState.updateInstrument(instrument, this.instrumentState);
  instrument.clearModified();
}

module.Manager = function(onInstrumentsLoaded) {
  this.presets = [];
  this.onInstrumentsLoaded = onInstrumentsLoaded;
  this.loadPresets();
}

module.Manager.prototype.loadPresets = function() {
  var manager = this;
  chrome.runtime.getPackageDirectoryEntry(function(packageEntry) {
    packageEntry.getDirectory('presets', {create: false}, function(presetsEntry) {
      var processEntry = function(entry, then) {
        FileUtil.readFile(entry, function(text) {
          var fromJSON = JSON.parse(text);
          manager.presets.push(new SavedInstrument(fromJSON.name, true, fromJSON.instrumentState));
          if (fromJSON.default)
            manager.default = manager.presets[manager.presets.length-1];
          then();
        });
      };

      FileUtil.forEachEntry(presetsEntry, processEntry, manager.onInstrumentsLoaded);
    });
  });
}

module.Manager.prototype.export = function(instrument) {
  var jsonObject = {};
  jsonObject.instrumentState = InstrumentState.getInstrumentState(instrument);
  var jsonText = JSON.stringify(jsonObject, null, 2);
  chrome.fileSystem.chooseEntry({type: 'saveFile'}, function(entry) {
    FileUtil.writeFile(entry, jsonText);
  });
}

return module;

})();