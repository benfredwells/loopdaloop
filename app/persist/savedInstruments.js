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
  chrome.runtime.getPackageDirectoryEntry(function(entry) {
    manager.presets.push(new SavedInstrument(gClassic.name, true, gClassic.instrumentState));
    manager.presets.push(new SavedInstrument(gBassline.name, true, gBassline.instrumentState));
    manager.default = manager.presets[0];
    manager.onInstrumentsLoaded();
  });
}

return module;

})();