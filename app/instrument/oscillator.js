Oscillator = (function() {

"use strict";
var module = {};

module.createNode = function(context, type) {
  var node = context.createOscillator();
  node.type = type;
  return node;
}

return module;

}());
