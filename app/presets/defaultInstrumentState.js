DefaultInstrumentState = (function() {

"use strict";

var module = {};

module.Default = function() {
  return {
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
          contours: {
            flat: {
              value: 4
            },
            oscillating: {
              maxValue: 5,
              minValue: 3,
              frequency: 1
            },
            adsr: {
              initialValue: 4,
              attackTime: 0.1,
              attackValue: 8,
              decayTime: 0.5,
              sustainValue: 4,
              releaseTime: 0.1,
              finalValue: 8
            }
          }
        }
      },
      {
        enabled: false,
        type: 'lowpass',
        q: 0,
        frequency: {
          currentContour: 'flat',
          contours: {
            flat: {
              value: 4
            },
            oscillating: {
              maxValue: 5,
              minValue: 3,
              frequency: 1
            },
            adsr: {
              initialValue: 4,
              attackTime: 0.1,
              attackValue: 8,
              decayTime: 0.5,
              sustainValue: 4,
              releaseTime: 0.1,
              finalValue: 8
            }
          }
        }
      }
    ],
    envelope: {
      currentContour: 'adsr',
      contours: {
        adsr: {
          attackTime: 0.1,
          decayTime: 0.5,
          sustainValue: 0.5,
          releaseTime: 0.3
        }
      }
    }
  };
}

return module;

})();