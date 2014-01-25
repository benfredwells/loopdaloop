SavedInstruments = (function() {

"use strict"

var module = {}

var SavedInstrument = function(name, isPreset, state) {
  this.name = name;
  this.isPreset = isPreset;
  this.state = state;
}

module.Manager = function() {
  this.presets = [];
  this.presets.push(new SavedInstrument(gClassic.name, true, gClassic.state));
  this.presets.push(new SavedInstrument(gBassline.name, true, gBassline.state));
  this.default = this.presets[0];
}

return module;

})();