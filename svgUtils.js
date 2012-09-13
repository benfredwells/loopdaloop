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
  return svg;
}

module.createLine = function(x1, y1, x2, y2, color, width, doc, svg) {
  var line = doc.createElementNS(svgns, "line");
  line.setAttributeNS(null, "x1", svgNumberVal(x1));
  line.setAttributeNS(null, "y1", svgNumberVal(y1));
  line.setAttributeNS(null, "x2", svgNumberVal(x2));
  line.setAttributeNS(null, "y2", svgNumberVal(y2));
  line.setAttributeNS(null, "stroke", color);
  line.setAttributeNS(null, "stroke-width", svgNumberVal(width));
  svg.appendChild(line);
  return line;
}

module.createPolyLine = function(points, color, width, doc, svg) {
  var line = doc.createElementNS(svgns, "polyline");
  line.setAttributeNS(null, "points", svgPointArrayVal(points));
  line.setAttributeNS(null, "stroke", color);
  line.setAttributeNS(null, "stroke-width", svgNumberVal(width));
  line.setAttributeNS(null, "fill", "none");
  svg.appendChild(line);
  return line;
}

module.createPath = function(path, color, width, doc, svg) {
  var pathEl = doc.createElementNS(svgns, "path");
  pathEl.setAttributeNS(null, "d", path);
  pathEl.setAttributeNS(null, "stroke", color);
  pathEl.setAttributeNS(null, "stroke-width", svgNumberVal(width));
  pathEl.setAttributeNS(null, "fill", "none");
  svg.appendChild(pathEl);
  return pathEl;
}

module.createCircle = function(cx, cy, r, color, width, fill, doc, svg) {
  var circle = doc.createElementNS(svgns, "circle");
  circle.setAttributeNS(null, "cx", svgNumberVal(cx));
  circle.setAttributeNS(null, "cy", svgNumberVal(cy));
  circle.setAttributeNS(null, "r",  svgNumberVal(r));
  circle.setAttributeNS(null, "fill", fill);
  circle.setAttributeNS(null, "stroke", color);
  circle.setAttributeNS(null, "stroke-width", width);
  svg.appendChild(circle);
  return circle;
}

return module;

})();
