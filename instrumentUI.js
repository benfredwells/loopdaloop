////////////////////////////////////////////////////////////////////////////////
// Oscillator constants
var gWaveTypes = ['SINE', 'SQUARE', 'SAWTOOTH', 'TRIANGLE'];

////////////////////////////////////////////////////////////////////////////////
// Filter constants
var gFilterTypes = ['LOWPASS', 'HIGHPASS', 'BANDPASS', 'LOWSHELF', 'HIGHSHELF',
                    'PEAKING', 'NOTCH', 'ALLPASS'];
var gFilterHasGain = [false, false, false, true, true, true, false, false];
var gFilterFrequencyFactors = [0.5, 0.707, 1, 1.414, 2, 2.828];

////////////////////////////////////////////////////////////////////////////////
// LFO constants
var gMaxLFOFrequencyRangeValue = 100;
var gLFOFrequencyExponentFactor = 1/25;
var gMaxLFOGainRangeValue = 100;
var gMaxLFOPhaseRangeValue = 36;

function InstrumentUI(instrument,
                      // oscillator settings
                      waveTypeSelect,
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
  // Utils
  ui.populateSelect_ = function(element, array) {
    for (var i = 0; i < array.length; i++) {
      var option = document.createElement('option');
      option.value = i;
      option.text = array[i];
      element.add(option, null);
    }
  }

  ui.roundForDisplay_ = function(number) {
    return Math.round(number * 100) / 100;
  }

  //////////////////////////////////////////////////////////////////////////////
  // Settings accessors

  ui.waveType_ = function() {
    return ui.waveTypeSelect_.value;
  }

  ui.filterEnabled_ = function() {
    return ui.filterCheckBox_.checked;
  }

  ui.filterType_ = function() {
    return ui.filterTypeSelect_.value;
  }

  ui.filterFrequencyFactor_ = function() {
    return gFilterFrequencyFactors[ui.filterFrequencyRange_.value];
  }

  ui.filterQ_ = function() {
    return ui.filterQRange_.value;
  }

  ui.filterGain_ = function() {
    return ui.filterGainRange_.value;
  }

  ui.filterLFOEnabled_ = function() {
    return ui.filterLFOCheckBox_.checked;
  }

  ui.filterLFOFrequency_ = function() {
    var rangeValue = ui.filterLFOFrequencyRange_.value;
    rangeValue = rangeValue - (gMaxLFOFrequencyRangeValue / 2);
    rangeValue = rangeValue * gLFOFrequencyExponentFactor;
    return Math.pow(10, rangeValue);
  }

  ui.filterLFOGainFactor_ = function() {
    return ui.filterLFOGainRange_.value / gMaxLFOGainRangeValue;
  }

  ui.filterLFOPhase_ = function() {
    return 2 * Math.PI * ui.filterLFOPhaseRange_.value / gMaxLFOPhaseRangeValue;
  }

  ui.filterLFOPhaseDegrees_ = function() {
    var value = 360 * ui.filterLFOPhaseRange_.value / gMaxLFOPhaseRangeValue;
    if (value > 180)
      value = value - 360;
    return value;
  }

  //////////////////////////////////////////////////////////////////////////////
  // Event handlers

  ui.waveTypeChanged = function() {
    ui.instrument_.oscillatorType = ui.waveType_();
  }

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

    ui.filterGainRange_.disabled = !gFilterHasGain[ui.filterType_()] || !ui.filterEnabled_();
    ui.filterGainChanged();
  }

  ui.filterFrequencyFactorChanged = function() {
    ui.instrument_.filterFrequencyFactor = ui.filterFrequencyFactor_();

    ui.filterFrequencyFactorLabel_.innerHTML = '(x' + ui.filterFrequencyFactor_() + ')';
  }

  ui.filterQChanged = function() {
    ui.instrument_.filterQ = ui.filterQ_();

    ui.filterQLabel_ = ui.filterQ_();
  }

  ui.filterGainChanged = function() {
    ui.instrument_.filterGain = ui.filterGain_();

    var el = document.getElementById('filterGain');
    var outEl = document.getElementById('selectedFilterGain');
    if (gFilterHasGain[ui.filterType_()])
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

    ui.filterLFOFrequencyFactorLabel_.innerHTML = roundForDisplay(ui.filterLFOFrequency_());
  }

  ui.filterLFOGainFactorChanged = function() {
    ui.instrument_.filterLFOGainFactor = ui.filterLFOGainFactor_();

    ui.filterLFOGainLabel_.innerHTML = '+-' + roundForDisplay(ui.filterLFOGainFactor_());
  }

  ui.filterLFOPhaseChanged = function() {
    ui.instrument_.filterLFOPhase = ui.filterLFOPhase_();

    ui.filterLFOPhaseLabel_.innerHTML = ui.filterLFOPhaseDegrees_();
  }

  //////////////////////////////////////////////////////////////////////////////
  // Private fields
  ui.instrument_ = instrument;
  ui.waveTypeSelect_ = waveTypeSelect;
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
  ui.waveTypeSelect_.onchange = ui.waveTypeChanged;
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
  ui.populateSelect_(ui.waveTypeSelect_, gWaveTypes);
  ui.populateSelect_(ui.filterTypeSelect_, gFilterTypes);
  ui.filterEnabledChanged(); // will update type, gain and lfo enabled
  ui.filterFrequencyFactorChanged();
  ui.filterQChanged();
  ui.filterLFOFrequencyChanged();
  ui.filterLFOGainFactorChanged();
  ui.filterLFOPhaseChanged();
}