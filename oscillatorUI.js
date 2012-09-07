OscillatorUI = (function() {

"use strict";
var module = [];
var svgns = "http://www.w3.org/2000/svg";

module.UI = function(element) {
  this.element_ = element;

  this.heading_ = document.createElement('div');
  this.heading_.classList.add('instrSettingHeading');
  this.heading_.innerHTML = 'Oscillator';
  this.element_.appendChild(this.heading_);

  this.details_ = document.createElement('div');
  this.element_.appendChild(this.details_);

  var settings = document.createElement('div');
  settings.classList.add('instrSettingBlock');
  this.details_.appendChild(settings);

  var typeRow = document.createElement('div');
  typeRow.classList.add('instrSettingRow');
  settings.appendChild(typeRow);

  var typeLabel = document.createElement('div');
  typeLabel.classList.add('instrSettingDescr');
  typeLabel.innerHTML = 'Type';
  typeRow.appendChild(typeLabel);

  var typeSetting = document.createElement('div');
  typeSetting.classList.add('instrSetting');
  typeRow.appendChild(typeSetting);

  this.typeSelect_ = document.createElement('select');
  typeSetting.appendChild(this.typeSelect_);

  var display = document.createElement('div');
  display.classList.add('instrDisplay');
  this.details_.appendChild(display);

  var svgDocument = this.element_.ownerDocument;
  var svgElem = svgDocument.createElementNS(svgns, "svg:svg");
  var shape = svgDocument.createElementNS(svgns, "circle");
  shape.setAttributeNS(null, "cx", "50");
  shape.setAttributeNS(null, "cy", "50");
  shape.setAttributeNS(null, "r",  "40");
  shape.setAttributeNS(null, "fill", "none");
  shape.setAttributeNS(null, "stroke", "blue");
  shape.setAttributeNS(null, "stroke-width", "3");
  svgElem.appendChild(shape);
  display.appendChild(svgElem);
}

return module;

})();