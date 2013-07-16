DefaultInstrumentState = (function() {

"use strict";

var module = {};

module.Default = function() {
  return {
    oscillatorStates: [
      {
        type: 'sine',
      },
      {
        type: 'square',
      },
      {
        type: 'triangle',
      }
    ]
  };
}

return module;

})();