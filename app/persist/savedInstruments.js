SavedInstruments = (function() {

"use strict"

var module = {}

var SavedInstrument = function(name, isPreset, instrumentState) {
  this.name = name;
  this.isPreset = isPreset;
  this.instrumentState = instrumentState;
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

return module;

})();