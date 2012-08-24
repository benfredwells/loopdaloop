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
                      filterLFOGainRange, filterLFOPhaseRange) {
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
  this.populateSelect_(this.waveTypeSelect_, gWaveTypes);
  this.waveTypeSelect_.onchange = this.waveTypeChanged;
  this.populateSelect_(this.filterTypeSelect_, gFilterTypes);
  this.filterCheckBox_.onchange = this.filterEnabledChanged;
  this.filterTypeSelect_.onchange = this.filterTypeChanged;
  this.filterFrequencyRange_.onchange = this.filterFrequencyChanged;
  this.fitlerQRange_.onchange = this.filterQChanged;
  this.filterGainRange_.onchange = this.filterGainChanged;
  this.filterEnabledChanged(); // will update type, gain and lfo enabled
  this.filterFrequencyChanged();
  this.filterQChanged();
  this.filterLFOCheckBox_.onchange = this.filterLFOEnabledChanged;
  this.filterLFOFrequencyRange_.onchange = this.filterLFOFrequencyChanged;
  this.filterLFOGainRange_.onchange = this.filterLFOGainChanged;
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

Instrument.UI.prototype.filterFrequency_ = function() {
  return this.oscillatorFrequency_() * this.filterFrequencyFactor_();
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

Instrument.UI.prototype.filterLFOGain_ = function() {
  var maxSwing = this.filterFrequency_();
  return maxSwing * this.filterLFOGainFactor_();
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

Instrument.UI.prototype.function oscillatorFrequencyChanged() {
  var outEl = document.getElementById('selectedOscillatorFrequency');
  outEl.innerHTML = roundForDisplay(oscillatorFrequency());
  filterFrequencyChanged();
}

Instrument.UI.prototype.function octaveChanged() {
  gInstrument.octave = octave();

  var el = document.getElementById('octave');
  var outEl = document.getElementById('selectedOctave');
  outEl.innerHTML = el.value;
  oscillatorFrequencyChanged();
}

Instrument.UI.prototype.function noteChanged() {
  gInstrument.note = note();

  var el = document.getElementById('note');
  var outEl = document.getElementById('selectedNote');
  outEl.innerHTML = gNotes[el.value];
  oscillatorFrequencyChanged();
}

Instrument.UI.prototype.function waveTypeChanged() {
  gInstrument.oscillatorType = waveType();
}

Instrument.UI.prototype.function filterEnabledChanged() {
  gInstrument.filterEnabled = filterEnabled();

  document.getElementById('filterTypes').disabled = !filterEnabled();
  document.getElementById('filterFrequency').disabled = !filterEnabled();
  document.getElementById('filterQ').disabled = !filterEnabled();
  document.getElementById('filterLFOEnabled').disabled = !filterEnabled();
  filterTypeChanged(); // to update gain
  filterLFOEnabledChanged();
}

Instrument.UI.prototype.function filterTypeChanged() {
  gInstrument.filterType = filterType();

  var gainEl = document.getElementById('filterGain');
  gainEl.disabled = !gFilterHasGain[filterType()] || !filterEnabled();
  filterGainChanged();
}

Instrument.UI.prototype.function filterFrequencyChanged() {
  gInstrument.filterFrequencyFactor = filterFrequencyFactor();

  var el = document.getElementById('filterFrequency');
  var outEl = document.getElementById('selectedFilterFrequency');
  var freqFactor = gFilterFrequencyFactors[el.value];
  outEl.innerHTML = roundForDisplay(filterFrequency()) +
                    ' (x' + freqFactor + ')';
  filterLFOGainChanged();
}

Instrument.UI.prototype.function filterQChanged() {
  gInstrument.filterQ = filterQ();

  var outEl = document.getElementById('selectedQ');
  outEl.innerHTML = filterQ();
}

Instrument.UI.prototype.function filterGainChanged() {
  gInstrument.filterGain = filterGain();

  var el = document.getElementById('filterGain');
  var outEl = document.getElementById('selectedFilterGain');
  if (gFilterHasGain[filterType()])
    outEl.innerHTML = filterGain() + 'dB';
  else
    outEl.innerHTML = 'N/A';
}

Instrument.UI.prototype.function filterLFOEnabledChanged() {
  var lfoEnabled = filterEnabled() && filterLFOEnabled();
  gInstrument.filterLFOEnabled = lfoEnabled;

  document.getElementById('filterLFOFrequency').disabled = !lfoEnabled;
  document.getElementById('filterLFOGain').disabled = !lfoEnabled;
  document.getElementById('filterLFOPhase').disabled = !lfoEnabled;
}

Instrument.UI.prototype.function filterLFOFrequencyChanged() {
  gInstrument.filterLFOFrequency = filterLFOFrequency();

  var outEl = document.getElementById('selectedFilterLFOFrequency');
  outEl.innerHTML = roundForDisplay(filterLFOFrequency());
}

Instrument.UI.prototype.function filterLFOGainChanged() {
  gInstrument.filterLFOGainFactor = filterLFOGainFactor();

  var outEl = document.getElementById('selectedFilterLFOGain');
  outEl.innerHTML = roundForDisplay(filterLFOGain());
}

Instrument.UI.prototype.function filterLFOPhaseChanged() {
  gInstrument.filterLFOPhase = filterLFOPhase();

  var outEl = document.getElementById('selectedFilterLFOPhase');
  outEl.innerHTML = filterLFOPhaseDegrees();
}
