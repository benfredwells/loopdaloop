DefaultInstrumentState = (function() {

"use strict";

var module = {};

module.Default = function() {
  return {
    pitch: { 
      currentContour: 'flat',
      initialValue: 0,
      sustainValue: 0,
      finalValue: 0,
      oscillationMinValue: -0.1,
      oscillationMaxValue: 0.1
    },
    oscillators: [
      {
        type: 'sine',
        enabled: true
      },
      {
        type: 'square',
        enabled: true,
        octaveOffset: 1,
        noteOffset: 5
      }
    ],
    filters: [
      {
        enabled: true,
        type: 'lowpass',
        frequency: {
          currentContour: 'flat',
          sustainValue: 4
        }
      },
      {
        enabled: false,
        type: 'lowpass',
        q: 0,
        frequency: {
          currentContour: 'flat',
          sustainValue: 4
        }
      }
    ],
    envelope: {
      currentContour: 'adsr',
      firstStageTime: 0.1,
      intermediateStages: [
        {
          duration: 0.2
        }
      ],
      releaseTime: 0.3
    }
  };
}

return module;

})();