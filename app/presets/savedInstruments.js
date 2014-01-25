SavedInstruments = (function() {

"use strict"

var module = {}

var SavedInstrument = function(name, isPreset, instrumentState) {
  this.name = name;
  this.isPreset = isPreset;
  this.instrumentState = instrumentState;
}

module.Manager = function() {
  this.presets = [];
  this.presets.push(new SavedInstrument(gClassic.name, true, gClassic.instrumentState));
  this.presets.push(new SavedInstrument(gBassline.name, true, gBassline.instrumentState));
  this.default = this.presets[0];
}

return module;

})();