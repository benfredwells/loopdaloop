DefaultInstrumentState = (function() {

"use strict";

var module = {};

module.Default = function() {
  return {
    oscillators: [
      {
        type: 'sine',
        enabled: true,
        octaveOffset: 0,
        noteOffset: 0,
        detune: 0
      },
      {
        type: 'square',
        enabled: true,
        octaveOffset: 1,
        noteOffset: 5,
        detune: 0
      },
      {
        type: 'triangle',
        enabled: false,
        octaveOffset: 0,
        noteOffset: 0,
        detune: 0
      }
    ],
    filters: [
      {
        enabled: true,
        type: 'lowpass',
        q: 0,
        frequency: {
          currentContour: 'flat',
          contours: {
            flat: {
              value: 4
            },
            oscillating: {
              centerValue: 4,
              amplitude: 0.1,
              frequency: 1
            },
            adsr: {
              initialValue: 4,
              attackDelay: 0,
              attackTime: 0.1,
              attackValue: 8,
              decayTime: 0.5,
              attackHold: 0,
              sustainValue: 4,
              sustainHold: 0,
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
              centerValue: 4,
              amplitude: 0.1,
              frequency: 1
            },
            adsr: {
              initialValue: 4,
              attackDelay: 0,
              attackTime: 0.1,
              attackValue: 8,
              attackHold: 0,
              decayTime: 0.5,
              sustainValue: 4,
              sustainHold: 0,
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
        flat: {
          value: 1
        },
        oscillating: {
          centerValue: 1,
          amplitude: 0.1,
          frequency: 1
        },
        adsr: {
          initialValue: 0,
          attackDelay: 0,
          attackTime: 0.1,
          attackValue: 1,
          attackHold: 0,
          decayTime: 0.5,
          sustainValue: 0.5,
          sustainHold: 0,
          releaseTime: 0.3,
          finalValue: 0
        }
      }
    }
  };
}

return module;

})();