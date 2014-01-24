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
  this.presets.push(new SavedInstrument('Classic', true, null));
  this.presets.push(new SavedInstrument('Sawtooth Bass', true, null));
}

return module;

})();