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

function InstrumentUI(// oscillator settings
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
  this.instrument_ = new Instrument(gContext);
  this.waveTypeSelect_ = waveTypeSelect;
  this.filterCheckBox_ = filterCheckBox;
  this.filterTypeSelect_ = filterTypeSelect;
  this.filterFrequencyRange_ = filterFrequencyRange,
  this.filterQRange_ = filterQRange;
  this.filterGainRange_ = filterGainRange;
  this.filterLFOCheckBox_ = filterLFOCheckBox;
  this.filterLFOFrequencyRange_ = filterLFOFrequencyRange;
  this.filterLFOGainRange_ = filterLFOGainRange;
  this.filterLFOPhaseRange_ = filterLFOPhaseRange;
  this.filterFrequencyFactorLabel_ = filterFrequencyFactorLabel;
  this.filterQLabel_ = filterQLabel;
  this.filterGainLabel_ = filterGainLabel;
  this.filterLFOFrequencyFactorLabel_ = filterLFOFrequencyFactorLabel;
  this.filterLFOGainLabel_ = filterLFOGainLabel;
  this.filterLFOPhaseLabel_ = filterLFOPhaseLabel;
  this.populateSelect_(this.waveTypeSelect_, gWaveTypes);
  this.waveTypeSelect_.onchange = this.waveTypeChanged;
  this.populateSelect_(this.filterTypeSelect_, gFilterTypes);
  this.filterCheckBox_.onchange = this.filterEnabledChanged;
  this.filterTypeSelect_.onchange = this.filterTypeChanged;
  this.filterFrequencyRange_.onchange = this.filterFrequencyFactorChanged;
  this.fitlerQRange_.onchange = this.filterQChanged;
  this.filterGainRange_.onchange = this.filterGainChanged;
  this.filterEnabledChanged(); // will update type, gain and lfo enabled
  this.filterFrequencyChanged();
  this.filterQChanged();
  this.filterLFOCheckBox_.onchange = this.filterLFOEnabledChanged;
  this.filterLFOFrequencyRange_.onchange = this.filterLFOFrequencyChanged;
  this.filterLFOGainRange_.onchange = this.filterLFOGainFactorChanged;
  this.filterLFOPhaseRange_.onchange = this.filterLFOPhaseChanged;
  filterLFOFrequencyChanged();
  filterLFOGainChanged();
  filterLFOPhaseChanged();
}

////////////////////////////////////////////////////////////////////////////////
// Utils
InstrumentUI.prototype.populateSelect_ = function(element, array) {
  for (var i = 0; i < array.length; i++) {
    var option = document.createElement('option');
    option.value = i;
    option.text = array[i];
    element.add(option, null);
  }
}

Instrument.UI.prototype.roundForDisplay_ = function(number) {
  return Math.round(number * 100) / 100;
}

////////////////////////////////////////////////////////////////////////////////
// Settings accessors

Instrument.UI.prototype.waveType_ = waveType() {
  return this.waveTypeSelect_.value;
}

Instrument.UI.prototype.filterEnabled_ = function() {
  return this.filterCheckBox_.checked;
}

Instrument.UI.prototype.filterType_ = function() {
  return this.fitlerTypeRange_.value;
}

Instrument.UI.prototype.filterFrequencyFactor_ = function() {
  return gFilterFrequencyFactors[this.filterFrequencyRange_.value];
}

Instrument.UI.prototype.filterQ_ = function() {
  return this.filterQRange_.value;
}

Instrument.UI.prototype.filterGain_ = function() {
  return this.filterGainRange_.value;
}

Instrument.UI.prototype.filterLFOEnabled_ = function() {
  return this.filterLFOCheckBox_.checked;
}

Instrument.UI.prototype.filterLFOFrequency_ = function() {
  var rangeValue = this.filterLFOFrequencyRange_.value;
  rangeValue = rangeValue - (gMaxLFOFrequencyRangeValue / 2);
  rangeValue = rangeValue * gLFOFrequencyExponentFactor;
  return Math.pow(10, rangeValue);
}

Instrument.UI.prototype.filterLFOGainFactor_ = function() {
  return this.filterLFOGainRange_.value / gMaxLFOGainRangeValue;
}

Instrument.UI.prototype.filterLFOPhase_ = function() {
  return 2 * Math.PI * this.filterLFOPhaseRange_.value / gMaxLFOPhaseRangeValue;
}

Instrument.UI.prototype.filterLFOPhaseDegrees_ = function() {
  var value = 360 * this.filterLFOPhaseRange_.value / gMaxLFOPhaseRangeValue;
  if (value > 180)
    value = value - 360;
  return value;
}

////////////////////////////////////////////////////////////////////////////////
// Event handlers

Instrument.UI.prototype.waveTypeChanged = function() {
  gInstrument.oscillatorType = this.waveType_();
}

Instrument.UI.prototype.filterEnabledChanged = function() {
  gInstrument.filterEnabled = this.filterEnabled_();

  this.filterTypeSelect_.disabled = !this.filterEnabled_();
  this.filterFrequencyRange_.disabled = !this.filterEnabled_();
  this.filterQRange_.disabled = !this.filterEnabled_();
  this.filterLFOCheckBox_.disabled = !this.filterEnabled_();
  this.filterTypeChanged(); // to update gain enabled
  this.filterLFOEnabledChanged();
}

Instrument.UI.prototype.filterTypeChanged = function() {
  gInstrument.filterType = this.filterType_();

  this.filterGainRange_.disabled = !gFilterHasGain[filterType()] || !this.filterEnabled_();
  this.filterGainChanged();
}

Instrument.UI.prototype.filterFrequencyFactorChanged = function() {
  gInstrument.filterFrequencyFactor = this.filterFrequencyFactor_();

  this.filterFrequencyFactorLabel_.innerHTML = '(x' + this.filterFrequencyFactor_() + ')';
}

Instrument.UI.prototype.filterQChanged = function() {
  gInstrument.filterQ = thils.filterQ_();

  this.filterQLabel_ = this.filterQ_();
}

Instrument.UI.prototype.filterGainChanged = function() {
  gInstrument.filterGain = this.filterGain_();

  var el = document.getElementById('filterGain');
  var outEl = document.getElementById('selectedFilterGain');
  if (gFilterHasGain[this.filterType_()])
    this.filterGainLabel_.innerHTML = this.filterGain_() + 'dB';
  else
    this.filterGainLabel_.innerHTML = 'N/A';
}

Instrument.UI.prototype.filterLFOEnabledChanged = function() {
  var lfoEnabled = this.filterEnabled_() && this.filterLFOEnabled_();
  gInstrument.filterLFOEnabled = lfoEnabled;

  this.filterLFOFrequencyRange_.disabled = !lfoEnabled;
  this.filterLFOGainRange_.disabled = !lfoEnabled;
  this.filterLFOPhaseRange_.disabled = !lfoEnabled;
}

Instrument.UI.prototype.filterLFOFrequencyChanged = function() {
  gInstrument.filterLFOFrequency = this.filterLFOFrequency_();

  this.filterLFOFrequencyFactorLabel_.innerHTML = roundForDisplay(this.filterLFOFrequency_());
}

Instrument.UI.prototype.filterLFOGainFactorChanged = function() {
  gInstrument.filterLFOGainFactor = this.filterLFOGainFactor_();

  this.filterLFOGainLabel_.innerHTML = '+-' + roundForDisplay(this.filterLFOGainFactor_());
}

Instrument.UI.prototype.filterLFOPhaseChanged = function() {
  gInstrument.filterLFOPhase = this.filterLFOPhase_();

  this.filterLFOPhaseLabel_.innerHTML = filterLFOPhaseDegrees();
}
