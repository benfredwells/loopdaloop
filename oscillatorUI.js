OscillatorUI = (function() {

"use strict";
var module = {};
var svgns = "http://www.w3.org/2000/svg";

////////////////////////////////////////////////////////////////////////////////
// Oscillator constants
var kWaveTypes = ['SINE', 'SQUARE', 'SAWTOOTH', 'TRIANGLE'];

////////////////////////////////////////////////////////////////////////////////
// Private Utils
module.UI = function(instrument, element) {
  this.element_ = element;
  this.instrument_ = instrument;

  this.group_ = new SettingsUIGroup.Group(this.element_, 'Oscillator');
  this.typeSelect_ = this.group_.addSelectRow('Type', kWaveTypes);

  var svgDocument = this.element_.ownerDocument;
  var svgElem = svgDocument.createElementNS(svgns, "svg:svg");
  var shape = svgDocument.createElementNS(svgns, "circle");
  shape.setAttributeNS(null, "cx", "50");
  shape.setAttributeNS(null, "cy", "25");
  shape.setAttributeNS(null, "r",  "15");
  shape.setAttributeNS(null, "fill", "none");
  shape.setAttributeNS(null, "stroke", "blue");
  shape.setAttributeNS(null, "stroke-width", "3");
  svgElem.appendChild(shape);
  this.group_.display_.appendChild(svgElem);

  var ui = this;
  this.typeChanged = function() {
    ui.instrument_.oscillatorType = ui.type_();
  }

  this.typeSelect_.onchange = this.typeChanged;
}

module.UI.prototype.type_ = function() {
  return this.typeSelect_.value;
}

return module;

})();
