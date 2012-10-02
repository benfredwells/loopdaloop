SVGUtils = (function() {

"use strict";
var module = {};
var svgns = "http://www.w3.org/2000/svg";

function svgNumberVal(num) {
  return num.toString();
}

function svgPointVal(point) {
  return svgNumberVal(point.x) + "," + svgNumberVal(point.y);
}

function svgPointArrayVal(points) {
  var pointVals = [];
  for (var i = 0; i < points.length; i++) {
    pointVals.push(svgPointVal(points[i]));
  }
  return pointVals.join(" ");
}

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

module.addPointToArray = function(x, y, array) {
  var point = {};
  point.x = x;
  point.y = y;
  array.push(point);
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

module.createSVG = function(doc, parent) {
  var svg = doc.createElementNS(svgns, "svg:svg");
  parent.appendChild(svg);
  var defs = doc.createElementNS(svgns,'defs');
  svg.appendChild(defs);
  svg.defs = defs;
  return svg;
}

module.createLinearGradient = function(id, x1, y1, x2, y2, spread, doc, svg) {
  var gradient = doc.createElementNS(svgns, "linearGradient");
  gradient.setAttribute("id", id);
  gradient.setAttribute("x1", x1);
  gradient.setAttribute("x2", x2);
  gradient.setAttribute("y1", y1);
  gradient.setAttribute("y2", y2);
  gradient.setAttribute("spreadMethod", spread);
  svg.defs.appendChild(gradient);
  return gradient;
}

module.addStopToGradient = function(offset, stopColor, gradient, doc) {
  var stop = doc.createElementNS(svgns, "stop");
  stop.setAttribute("offset", offset);
  stop.setAttribute("stop-color", stopColor);
  gradient.appendChild(stop);
}

module.createLine = function(x1, y1, x2, y2, color, width, doc, svg) {
  var line = doc.createElementNS(svgns, "line");
  line.setAttribute("x1", svgNumberVal(x1));
  line.setAttribute("y1", svgNumberVal(y1));
  line.setAttribute("x2", svgNumberVal(x2));
  line.setAttribute("y2", svgNumberVal(y2));
  line.setAttribute("stroke", color);
  line.setAttribute("stroke-width", svgNumberVal(width));
  svg.appendChild(line);
  return line;
}

module.createRect = function(x, y, width, height, color, strokeWidth, fill, doc, svg) {
  var line = doc.createElementNS(svgns, "rect");
  line.setAttribute("x", svgNumberVal(x));
  line.setAttribute("y", svgNumberVal(y));
  line.setAttribute("width", svgNumberVal(width));
  line.setAttribute("height", svgNumberVal(height));
  line.setAttribute("stroke", color);
  line.setAttribute("stroke-width", svgNumberVal(strokeWidth));
  line.setAttribute("fill", fill);
  svg.appendChild(line);
  return line;
}

module.createPolyLine = function(points, color, width, fill, doc, svg) {
  var line = doc.createElementNS(svgns, "polyline");
  line.setAttribute("points", svgPointArrayVal(points));
  line.setAttribute("stroke", color);
  line.setAttribute("stroke-width", svgNumberVal(width));
  line.setAttribute("fill", fill);
  svg.appendChild(line);
  return line;
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

return module;

})();
