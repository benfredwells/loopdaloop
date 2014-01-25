var gBassline =

{
  "name": "Bassline",
  "state":
  {
    "pitch": {
      "units": "octave",
      "contour": {
        "currentContour": "sweep",
        "initialValue": -0.3,
        "attackTime": 0.0005,
        "numStages": 3,
        "intermediateStages": [
          {
            "beginValue": 0,
            "duration": 0.0005
          },
          {
            "beginValue": 0,
            "duration": 0.0005
          },
          {
            "beginValue": 0,
            "duration": 0.0005
          },
          {
            "beginValue": 0,
            "duration": 0.0005
          },
          {
            "beginValue": 0,
            "duration": 0.0005
          },
          {
            "beginValue": 0,
            "duration": 0.0005
          }
        ],
        "releaseTime": 0.0005,
        "finalValue": 0,
        "oscillationAmount": 0.5,
        "oscillationType": "constant",
        "oscillationWave": "sine",
        "oscillationMaxValue": 0.3,
        "oscillationMinValue": -0.3,
        "oscillationFrequency": 5,
        "oscillationTimeConstant": 0.5,
        "sweepTimeSetting": 0.15898139478014903
      }
    },
    "oscillators": [
      {
        "enabled": true,
        "type": "sawtooth",
        "octaveOffset": 0,
        "noteOffset": 0,
        "detune": -4,
        "gain": {
          "currentContour": "flat",
          "initialValue": 0,
          "attackTime": 0.0005,
          "numStages": 3,
          "intermediateStages": [
            {
              "beginValue": 1,
              "duration": 0.0005
            },
            {
              "beginValue": 0.5,
              "duration": 0.0005
            },
            {
              "beginValue": 0.5,
              "duration": 0.0005
            },
            {
              "beginValue": 0.5,
              "duration": 0.0005
            },
            {
              "beginValue": 0.5,
              "duration": 0.0005
            },
            {
              "beginValue": 0.5,
              "duration": 0.0005
            }
          ],
          "releaseTime": 0.0005,
          "finalValue": 0,
          "oscillationAmount": 0.5,
          "oscillationType": "constant",
          "oscillationWave": "sine",
          "oscillationMaxValue": 1,
          "oscillationMinValue": 0,
          "oscillationFrequency": 0.4,
          "oscillationTimeConstant": 0.5,
          "sweepTimeSetting": 1
        }
      },
      {
        "enabled": true,
        "type": "sawtooth",
        "octaveOffset": 0,
        "noteOffset": 0,
        "detune": 4,
        "gain": {
          "currentContour": "flat",
          "initialValue": 0,
          "attackTime": 0.0005,
          "numStages": 3,
          "intermediateStages": [
            {
              "beginValue": 1,
              "duration": 0.0005
            },
            {
              "beginValue": 0.5,
              "duration": 0.0005
            },
            {
              "beginValue": 0.5,
              "duration": 0.0005
            },
            {
              "beginValue": 0.5,
              "duration": 0.0005
            },
            {
              "beginValue": 0.5,
              "duration": 0.0005
            },
            {
              "beginValue": 0.5,
              "duration": 0.0005
            }
          ],
          "releaseTime": 0.0005,
          "finalValue": 0,
          "oscillationAmount": 0.5,
          "oscillationType": "constant",
          "oscillationWave": "sine",
          "oscillationMaxValue": 1,
          "oscillationMinValue": 0,
          "oscillationFrequency": 0.4,
          "oscillationTimeConstant": 0.5,
          "sweepTimeSetting": 1
        }
      },
      {
        "enabled": true,
        "type": "square",
        "octaveOffset": -1,
        "noteOffset": 0,
        "detune": 0,
        "gain": {
          "currentContour": "flat",
          "initialValue": 0,
          "attackTime": 0.0005,
          "numStages": 3,
          "intermediateStages": [
            {
              "beginValue": 1,
              "duration": 0.0005
            },
            {
              "beginValue": 0.5,
              "duration": 0.0005
            },
            {
              "beginValue": 0.5,
              "duration": 0.0005
            },
            {
              "beginValue": 0.5,
              "duration": 0.0005
            },
            {
              "beginValue": 0.5,
              "duration": 0.0005
            },
            {
              "beginValue": 0.5,
              "duration": 0.0005
            }
          ],
          "releaseTime": 0.0005,
          "finalValue": 0,
          "oscillationAmount": 0.5,
          "oscillationType": "constant",
          "oscillationWave": "sine",
          "oscillationMaxValue": 1,
          "oscillationMinValue": 0,
          "oscillationFrequency": 0.4,
          "oscillationTimeConstant": 0.5,
          "sweepTimeSetting": 1
        }
      }
    ],
    "filters": [
      {
        "enabled": true,
        "type": "lowpass",
        "order": "fourth",
        "q": 6,
        "frequency": {
          "currentContour": "adsr",
          "initialValue": 0.5,
          "attackTime": 0.25167608371880046,
          "numStages": 3,
          "intermediateStages": [
            {
              "beginValue": 7.050000000000001,
              "duration": 0.25167608371880046
            },
            {
              "beginValue": 5.25,
              "duration": 0.0005
            },
            {
              "beginValue": 5.25,
              "duration": 0.0005
            },
            {
              "beginValue": 5.25,
              "duration": 0.0005
            },
            {
              "beginValue": 5.25,
              "duration": 0.0005
            },
            {
              "beginValue": 5.25,
              "duration": 0.0005
            }
          ],
          "releaseTime": 0.3985872651949696,
          "finalValue": 2.65,
          "oscillationAmount": 0.5,
          "oscillationType": "constant",
          "oscillationMaxValue": 1.3,
          "oscillationMinValue": 1.1,
          "oscillationFrequency": 3.169786384922228,
          "oscillationTimeConstant": 0.5,
          "sweepTimeSetting": 1
        }
      },
      {
        "enabled": false,
        "type": "lowpass",
        "order": "second",
        "q": 0,
        "frequency": {
          "currentContour": "flat",
          "initialValue": 0.5,
          "attackTime": 0.0005,
          "numStages": 3,
          "intermediateStages": [
            {
              "beginValue": 10,
              "duration": 0.0005
            },
            {
              "beginValue": 5.25,
              "duration": 0.0005
            },
            {
              "beginValue": 5.25,
              "duration": 0.0005
            },
            {
              "beginValue": 5.25,
              "duration": 0.0005
            },
            {
              "beginValue": 5.25,
              "duration": 0.0005
            },
            {
              "beginValue": 5.25,
              "duration": 0.0005
            }
          ],
          "releaseTime": 0.0005,
          "finalValue": 0.5,
          "oscillationAmount": 0.5,
          "oscillationType": "constant",
          "oscillationWave": "sine",
          "oscillationMaxValue": 10,
          "oscillationMinValue": 0.5,
          "oscillationFrequency": 0.4,
          "oscillationTimeConstant": 0.5,
          "sweepTimeSetting": 1
        }
      }
    ],
    "envelope": {
      "currentContour": "adsr",
      "initialValue": 0,
      "attackTime": 0.0005,
      "numStages": 3,
      "intermediateStages": [
        {
          "beginValue": 1,
          "duration": 0.0005
        },
        {
          "beginValue": 1,
          "duration": 0.0005
        },
        {
          "beginValue": 0.5,
          "duration": 0.0005
        },
        {
          "beginValue": 0.5,
          "duration": 0.0005
        },
        {
          "beginValue": 0.5,
          "duration": 0.0005
        },
        {
          "beginValue": 0.5,
          "duration": 0.0005
        }
      ],
      "releaseTime": 0.3985872651949696,
      "finalValue": 0,
      "oscillationAmount": 0.5,
      "oscillationType": "constant",
      "oscillationWave": "sine",
      "oscillationMaxValue": 1,
      "oscillationMinValue": 0,
      "oscillationFrequency": 0.4,
      "oscillationTimeConstant": 0.5,
      "sweepTimeSetting": 1
    }
  }
}