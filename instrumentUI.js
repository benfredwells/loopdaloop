InstrumentUI = (function() {

"use strict;"
module = [];

////////////////////////////////////////////////////////////////////////////////
// Filter constants
var kFilterTypes = ['LOWPASS', 'HIGHPASS', 'BANDPASS', 'LOWSHELF', 'HIGHSHELF',
                    'PEAKING', 'NOTCH', 'ALLPASS'];
var kFilterHasGain = [false, false, false, true, true, true, false, false];
var kFilterFrequencyFactors = [0.5, 0.707, 1, 1.414, 2, 2.828];

////////////////////////////////////////////////////////////////////////////////
// LFO constants
var kMaxLFOFrequencyRangeValue = 100;
var kLFOFrequencyExponentFactor = 1/25;
var kMaxLFOGainRangeValue = 100;
var kMaxLFOPhaseRangeValue = 36;

module.UI = function (instrument,
                      // filter settings
                      filterCheckBox, filterTypeSelect, filterFrequencyRange,
                      filterQRange, filterGainRange,
                      // filterLFO settings
                      filterLFOCheckBox, filterLFOFrequencyRange,
                      filterLFOGainRange, filterLFOPhaseRange,
                      // filter display
                      filterFrequencyFactorLabel, filterQLabel, filterGainLabel,
                      // filterLFO display
                      filterLFOFrequencyFactorLabel, filterLFOGainLabel,
                      filterLFOPhaseLabel) {
  var ui = this;

  //////////////////////////////////////////////////////////////////////////////
  // Event handlers

  ui.filterEnabledChanged = function() {
    ui.instrument_.filterEnabled = ui.filterEnabled_();

    ui.filterTypeSelect_.disabled = !ui.filterEnabled_();
    ui.filterFrequencyRange_.disabled = !ui.filterEnabled_();
    ui.filterQRange_.disabled = !ui.filterEnabled_();
    ui.filterLFOCheckBox_.disabled = !ui.filterEnabled_();
    ui.filterTypeChanged(); // to update gain enabled
    ui.filterLFOEnabledChanged();
  }

  ui.filterTypeChanged = function() {
    ui.instrument_.filterType = ui.filterType_();

    ui.filterGainRange_.disabled = !kFilterHasGain[ui.filterType_()] || !ui.filterEnabled_();
    ui.filterGainChanged();
  }

  ui.filterFrequencyFactorChanged = function() {
    ui.instrument_.filterFrequencyFactor = ui.filterFrequencyFactor_();

    ui.filterFrequencyFactorLabel_.innerHTML = '(x' + ui.filterFrequencyFactor_() + ')';
  }

  ui.filterQChanged = function() {
    ui.instrument_.filterQ = ui.filterQ_();

    ui.filterQLabel_.innerHTML = ui.filterQ_();
  }

  ui.filterGainChanged = function() {
    ui.instrument_.filterGain = ui.filterGain_();

    var el = document.getElementById('filterGain');
    var outEl = document.getElementById('selectedFilterGain');
    if (kFilterHasGain[ui.filterType_()])
      ui.filterGainLabel_.innerHTML = ui.filterGain_() + 'dB';
    else
      ui.filterGainLabel_.innerHTML = 'N/A';
  }

  ui.filterLFOEnabledChanged = function() {
    var lfoEnabled = ui.filterEnabled_() && ui.filterLFOEnabled_();
    ui.instrument_.filterLFOEnabled = lfoEnabled;

    ui.filterLFOFrequencyRange_.disabled = !lfoEnabled;
    ui.filterLFOGainRange_.disabled = !lfoEnabled;
    ui.filterLFOPhaseRange_.disabled = !lfoEnabled;
  }

  ui.filterLFOFrequencyChanged = function() {
    ui.instrument_.filterLFOFrequency = ui.filterLFOFrequency_();

    ui.filterLFOFrequencyFactorLabel_.innerHTML = ui.roundForDisplay_(ui.filterLFOFrequency_());
  }

  ui.filterLFOGainFactorChanged = function() {
    ui.instrument_.filterLFOGainFactor = ui.filterLFOGainFactor_();

    ui.filterLFOGainLabel_.innerHTML = '+-' + ui.roundForDisplay_(ui.filterLFOGainFactor_());
  }

  ui.filterLFOPhaseChanged = function() {
    ui.instrument_.filterLFOPhase = ui.filterLFOPhase_();

    ui.filterLFOPhaseLabel_.innerHTML = ui.filterLFOPhaseDegrees_();
  }

  //////////////////////////////////////////////////////////////////////////////
  // Private fields
  ui.instrument_ = instrument;
  ui.filterCheckBox_ = filterCheckBox;
  ui.filterTypeSelect_ = filterTypeSelect;
  ui.filterFrequencyRange_ = filterFrequencyRange,
  ui.filterQRange_ = filterQRange;
  ui.filterGainRange_ = filterGainRange;
  ui.filterLFOCheckBox_ = filterLFOCheckBox;
  ui.filterLFOFrequencyRange_ = filterLFOFrequencyRange;
  ui.filterLFOGainRange_ = filterLFOGainRange;
  ui.filterLFOPhaseRange_ = filterLFOPhaseRange;
  ui.filterFrequencyFactorLabel_ = filterFrequencyFactorLabel;
  ui.filterQLabel_ = filterQLabel;
  ui.filterGainLabel_ = filterGainLabel;
  ui.filterLFOFrequencyFactorLabel_ = filterLFOFrequencyFactorLabel;
  ui.filterLFOGainLabel_ = filterLFOGainLabel;
  ui.filterLFOPhaseLabel_ = filterLFOPhaseLabel;

  //////////////////////////////////////////////////////////////////////////////
  // Setup event halders
  ui.filterCheckBox_.onchange = ui.filterEnabledChanged;
  ui.filterTypeSelect_.onchange = ui.filterTypeChanged;
  ui.filterFrequencyRange_.onchange = ui.filterFrequencyFactorChanged;
  ui.filterQRange_.onchange = ui.filterQChanged;
  ui.filterGainRange_.onchange = ui.filterGainChanged;
  ui.filterLFOCheckBox_.onchange = ui.filterLFOEnabledChanged;
  ui.filterLFOFrequencyRange_.onchange = ui.filterLFOFrequencyChanged;
  ui.filterLFOGainRange_.onchange = ui.filterLFOGainFactorChanged;
  ui.filterLFOPhaseRange_.onchange = ui.filterLFOPhaseChanged;

  //////////////////////////////////////////////////////////////////////////////
  // Initialize UI
  ui.populateSelect_(ui.filterTypeSelect_, kFilterTypes);
  ui.filterEnabledChanged(); // will update type, gain and lfo enabled
  ui.filterFrequencyFactorChanged();
  ui.filterQChanged();
  ui.filterLFOFrequencyChanged();
  ui.filterLFOGainFactorChanged();
  ui.filterLFOPhaseChanged();
}

////////////////////////////////////////////////////////////////////////////////
// Utils
module.UI.prototype.populateSelect_ = function(element, array) {
  for (var i = 0; i < array.length; i++) {
    var option = document.createElement('option');
    option.value = i;
    option.text = array[i];
    element.add(option, null);
  }
}

module.UI.prototype.roundForDisplay_ = function(number) {
  return Math.round(number * 100) / 100;
}

////////////////////////////////////////////////////////////////////////////////
// Settings accessors

module.UI.prototype.filterEnabled_ = function() {
  return this.filterCheckBox_.checked;
}

module.UI.prototype.filterType_ = function() {
  return this.filterTypeSelect_.value;
}

module.UI.prototype.filterFrequencyFactor_ = function() {
  return kFilterFrequencyFactors[this.filterFrequencyRange_.value];
}

module.UI.prototype.filterQ_ = function() {
  return this.filterQRange_.value;
}

module.UI.prototype.filterGain_ = function() {
  return this.filterGainRange_.value;
}

module.UI.prototype.filterLFOEnabled_ = function() {
  return this.filterLFOCheckBox_.checked;
}

module.UI.prototype.filterLFOFrequency_ = function() {
  var rangeValue = this.filterLFOFrequencyRange_.value;
  rangeValue = rangeValue - (kMaxLFOFrequencyRangeValue / 2);
  rangeValue = rangeValue * kLFOFrequencyExponentFactor;
  return Math.pow(10, rangeValue);
}

module.UI.prototype.filterLFOGainFactor_ = function() {
  return this.filterLFOGainRange_.value / kMaxLFOGainRangeValue;
}

module.UI.prototype.filterLFOPhase_ = function() {
  return 2 * Math.PI * this.filterLFOPhaseRange_.value / kMaxLFOPhaseRangeValue;
}

module.UI.prototype.filterLFOPhaseDegrees_ = function() {
  var value = 360 * this.filterLFOPhaseRange_.value / kMaxLFOPhaseRangeValue;
  if (value > 180)
    value = value - 360;
  return value;
}

return module;

}());
