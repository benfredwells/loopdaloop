DefaultInstrumentState = (function() {

"use strict";

var module = {};

module.Default = function() {
  return {
    pitch: {
      contour: { 
        currentContour: 'flat',
        initialValue: -0.3,
        intermediateStages: [
          {
            beginValue: 0
          }
        ],
        sustainValue: 0,
        finalValue: 0,
        oscillationMinValue: -0.3,
        oscillationMaxValue: 0.3,
        oscillationFrequency: 5
      }
    },
    oscillators: [
      {
        type: 'sawtooth',
        enabled: true
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