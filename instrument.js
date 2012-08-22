////////////////////////////////////////////////////////////////////////////////
// Instrument class

function Instrument(context) {
  this.context_ = context;
  // Public fields
  this.oscillatorType = 0;
  this.filterEnabled = false;
  this.filterType = 0;
  this.filterFrequencyFactor = 0;
  this.filterQ = 0;
  this.filterGain = 0;
  this.filterLFOEnabled = false;
  this.filterLFOFrequency = 0;
  this.filterLFOGainFactor = 0;
  this.filterLFOPhase = 0;
}

// Private methods
Instrument.prototype.createOscillator_ = function(octave, note) {
  var oscillator = this.context_.createOscillator();
  oscillator.frequency.value = frequencyForNote(octave, note);
  oscillator.type = this.oscillatorType;
  return oscillator;
}

Instrument.prototype.createFilter_ = function(octave, note) {
  var filterFrequency = frequencyForNote(octave, note) * this.filterFrequencyFactor;
  var filter = this.context_.createBiquadFilter();
  filter.type = this.filterType;
  filter.frequency.value = filterFrequency;
  filter.Q.value = this.filterQ;
  filter.gain.value = this.filterGain;
  return filter;
}

Instrument.prototype.createFilterLFO_ = function(filter) {
  return gControllerManager.newLFO(filter.frequency,
                                   this.filterLFOFrequency,
                                   this.filterLFOPhase,
                                   filter.frequency.value,
                                   filter.frequency.value * this.filterLFOGainFactor);
}

Instrument.prototype.createGainNode_ = function() {
  var gainNode = this.context_.createGainNode();
  gainNode.gain.setValueAtTime(0, this.context_.currentTime);
  gainNode.gain.setTargetValueAtTime(1, this.context_.currentTime, 0.1);
  return gainNode;
}

// Public methods
Instrument.prototype.createPlayedNote = function(octave, note) {
  var oscillator = this.createOscillator_(octave, note);
  var gainNode = this.createGainNode_();
  var allNodes = [oscillator, gainNode];
  var paramControllers = [];
  if (this.filterEnabled) {
    var filter = this.createFilter_(octave, note);
    allNodes.push(filter);
    oscillator.connect(filter);
    filter.connect(gainNode);
    if (this.filterLFOEnabled) {
      paramControllers.push(this.createFilterLFO_(filter));
    }
  } else {
    oscillator.connect(gainNode);
  }
  gainNode.connect(this.context_.destination);
  return new PlayedNote(this.context_, [oscillator], gainNode, allNodes, paramControllers);
}
