AudioConstants = (function() {

"use strict";
var module = {};

////////////////////////////////////////////////////////////////////////////////
// Identifiers for waves
module.kSineWave = 'sine';
module.kSquareWave = 'square';
module.kSawtoothWave = 'sawtooth';
module.kTriangleWave = 'triangle';
module.kWaveTypes = [module.kSineWave, module.kSquareWave, module.kSawtoothWave, module.kTriangleWave];

////////////////////////////////////////////////////////////////////////////////
// Identifiers for filter types
module.kLowPassFilter = 'lowpass';
module.kHighPassFilter = 'highpass';
module.kFilterTypes = [module.kLowPassFilter, module.kHighPassFilter];

////////////////////////////////////////////////////////////////////////////////
// Identifiers for filter strength
module.kSecondOrder = 'second';
module.kFourthOrder = 'fourth';
module.kSixthOrder = 'sixth';
module.kFilterOrders = [module.kSecondOrder, module.kFourthOrder, module.kSixthOrder];

module.kFilterOrderNodes = {};
module.kFilterOrderNodes[module.kSecondOrder] = 1;
module.kFilterOrderNodes[module.kFourthOrder] = 2;
module.kFilterOrderNodes[module.kSixthOrder] = 3;

return module;

}());
