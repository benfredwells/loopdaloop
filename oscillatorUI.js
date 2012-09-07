OscillatorUI = (function() {

"use strict";
var module = [];
var svgns = "http://www.w3.org/2000/svg";

module.Visualization = function(element) {
  this.element_ = element;

  var svgDocument = this.element_.ownerDocument;
  var svgElem = svgDocument.createElementNS(svgns, "svg:svg");
  var shape = svgDocument.createElementNS(svgns, "circle");
  shape.setAttributeNS(null, "cx", "25px");
  shape.setAttributeNS(null, "cy", "25px");
  shape.setAttributeNS(null, "r",  "20px");
  shape.setAttributeNS(null, "fill", "green");
  svgElem.appendChild(shape);
  this.element_.appendChild(svgElem);
}

return module;

})();