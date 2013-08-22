SVGUI = (function() {

"use strict";
var module = {};
var svgns = "http://www.w3.org/2000/svg";

function svgNumberVal(num) {
  return num.toString();
}

function svgPointVal(point) {
  return svgNumberVal(point.x) + "," + svgNumberVal(point.y);
}

module.PointList = function() {
  this.points_ = [];
}

module.PointList.prototype.addPoint = function(x, y) {
  var point = {};
  point.x = x;
  point.y = y;
  this.points_.push(point);
}

module.PointList.prototype.value = function() {
  var pointVals = [];
  for (var i = 0; i < this.points_.length; i++) {
    pointVals.push(svgPointVal(this.points_[i]));
  }
  return pointVals.join(" ");
}

module.SVGControl = function(container) {
  SettingsUI.Control.call(this, container);

  this.svg_ = document.createElementNS(svgns, "svg:svg");
  this.div.appendChild(this.svg_);
  this.primitives_ = [];
  // SVG Defs not currently used. Useful for gradients
  // and other reusable definitions.
  //this.svgDefs_ = doc.createElementNS(svgns,'defs');
  //svg.appendChild(defs);
}

module.SVGControl.prototype = Object.create(SettingsUI.Control.prototype);

module.SVGControl.prototype.clear = function() {
  var svgControl = this;
  this.primitives_.forEach(function (primitive) {
    svgControl.svg_.removeChild(primitive);
  });
  this.primitives_ = [];
}

module.SVGControl.prototype.drawLine = function(x1, y1, x2, y2, color, width) {
  var line = document.createElementNS(svgns, "line");
  line.setAttribute("x1", svgNumberVal(x1));
  line.setAttribute("y1", svgNumberVal(y1));
  line.setAttribute("x2", svgNumberVal(x2));
  line.setAttribute("y2", svgNumberVal(y2));
  line.setAttribute("stroke", color);
  line.setAttribute("stroke-width", svgNumberVal(width));
  this.svg_.appendChild(line);
  this.primitives_.push(line);
}

module.SVGControl.prototype.drawRect = function(x, y, width, height, color, strokeWidth, fill) {
  var rect = document.createElementNS(svgns, "rect");
  rect.setAttribute("x", svgNumberVal(x));
  rect.setAttribute("y", svgNumberVal(y));
  rect.setAttribute("width", svgNumberVal(width));
  rect.setAttribute("height", svgNumberVal(height));
  rect.setAttribute("stroke", color);
  rect.setAttribute("stroke-width", svgNumberVal(strokeWidth));
  rect.setAttribute("fill", fill);
  this.svg_.appendChild(rect);
  this.primitives_.push(rect);;
}

module.SVGControl.prototype.drawPolyLine = function(pointList, color, width, fill) {
  var line = document.createElementNS(svgns, "polyline");
  line.setAttribute("points", pointList.value());
  line.setAttribute("stroke", color);
  line.setAttribute("stroke-width", svgNumberVal(width));
  line.setAttribute("fill", fill);
  this.svg_.appendChild(line);
  this.primitives_.push(line);
  return line;
}

return module;

})();

/*
Old stuff, might be handy later.

function channelToHex(channel) {
  var hex = Math.round(channel).toString(16);
  while (hex.length < 2)
    hex = '0' + hex;
  return hex;
}

function rgbToColor(rgb) {
  return '#' + channelToHex(rgb.r) + channelToHex(rgb.g) + channelToHex(rgb.b);
}

function hexToChannel(hex) {
  return parseInt(hex, 16);
}

function colorToRGB(color) {
  var rgb = {};
  rgb.r = hexToChannel(color.slice(1, 3));
  rgb.g = hexToChannel(color.slice(3, 5));
  rgb.b = hexToChannel(color.slice(5, 7));
  return rgb;
}

function interpolateValue(valueAt0, valueAt1, pos) {
  return valueAt0 + (valueAt1 - valueAt0) * pos;
}

module.interpolateColors = function(colorAt0, colorAt1, pos) {
  var rgbAt0 = colorToRGB(colorAt0);
  var rgbAt1 = colorToRGB(colorAt1);
  var rgb = {};
  rgb.r = interpolateValue(rgbAt0.r, rgbAt1.r, pos);
  rgb.g = interpolateValue(rgbAt0.g, rgbAt1.g, pos);
  rgb.b = interpolateValue(rgbAt0.b, rgbAt1.b, pos);
  return rgbToColor(rgb);
}

module.startPath = function(x, y) {
  var path = "M" + svgNumberVal(x) + " " + svgNumberVal(y) + " ";
  return path;
}

module.addCubicToPath = function(useDelta, path, x1, y1, x2, y2, x3, y3) {
  if (useDelta)
    path = path + "c ";
  else
    path = path + "C ";
  var points = [];
  module.addPointToArray(x1, y1, points);
  module.addPointToArray(x2, y2, points);
  module.addPointToArray(x3, y3, points);
  path = path + svgPointArrayVal(points) + " ";
  return path;
}

module.createPath = function(path, color, width, doc, svg) {
  var pathEl = doc.createElementNS(svgns, "path");
  pathEl.setAttribute("d", path);
  pathEl.setAttribute("stroke", color);
  pathEl.setAttribute("stroke-width", svgNumberVal(width));
  pathEl.setAttribute("fill", "none");
  svg.appendChild(pathEl);
  return pathEl;
}

module.createCircle = function(cx, cy, r, color, width, fill, doc, svg) {
  var circle = doc.createElementNS(svgns, "circle");
  circle.setAttribute("cx", svgNumberVal(cx));
  circle.setAttribute("cy", svgNumberVal(cy));
  circle.setAttribute("r",  svgNumberVal(r));
  circle.setAttribute("fill", fill);
  circle.setAttribute("stroke", color);
  circle.setAttribute("stroke-width", width);
  svg.appendChild(circle);
  return circle;
}

*/