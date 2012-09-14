FilterUI = (function() {

"use strict";
var module = {};

var kFilterTypes = ['LOWPASS', 'HIGHPASS', 'BANDPASS', 'LOWSHELF', 'HIGHSHELF',
                    'PEAKING', 'NOTCH', 'ALLPASS'];

module.UI = function(instrument, element) {
  this.instrument_ = instrument;

  var s = SettingsUIGroup.makeSubRow;
  var ss = SettingsUIGroup.makeSubSubRow;
  this.group_ = new SettingsUIGroup.Group(element, 'Filter');
  this.enabledRow_ = this.group_.addCheckRow('Enabled');
  this.typeRow_ = s(this.group_.addSelectRow('Type', kFilterTypes));
  this.frequencyRow_ = s(this.group_.addLinearRangeRow('Frequency', 0.5, 3, 10));
  this.lfoEnabledRow_ = ss(this.group_.addCheckRow('Oscillate'));
  this.lfoFrequencyRow_ = ss(this.group_.addExponentialRangeRow('Speed', 10, -1, 1, 10));
  this.lfoGainRow_ = ss(this.group_.addExponentialRangeRow('Amplitude', 10, -2, 0, 10));
  this.lfoPhaseRow_ = ss(this.group_.addLinearRangeRow('Phase', -180, 180, 36));
  this.qRow_ = s(this.group_.addLinearRangeRow('Q', 0, 20, 20))
  this.gainRow_ = s(this.group_.addLinearRangeRow('Gain', -20, 20, 40));

  var ui = this;
  var changeHandler = function() {
    ui.instrument_.filterEnabled = ui.enabledRow_.check.value;
    ui.instrument_.filterType = ui.typeRow_.select.value;
    ui.instrument_.filterFrequencyFactor = ui.frequencyRow_.value();
    ui.instrument_.filterLFOEnabled = ui.lfoEnabledRow_.value();
    ui.instrument_.filterLFOFrequency = ui.lfoFrequencyRow_.value();
    ui.instrument_.filterLFOPhase = 2 * Math.PI * ui.lfoPhaseRow_.value() / 360;
    ui.instrument_.filterLFOGainFactor = ui.lfoGainRow_.value();
    ui.instrument_.filterQ = ui.qRow_.value();
    ui.instrument_.filterGain = ui.gainRow_.value();
    ui.updateDisplay_();
  }
  this.enabledRow_.check.onchange = changeHandler;
  this.typeRow_.select.onchange = changeHandler;
  this.frequencyRow_.range.onchange = changeHandler;
  this.lfoEnabledRow_.check.onchange = changeHandler;
  this.lfoFrequencyRow_.range.onchange = changeHandler;
  this.lfoGainRow_.range.onchange = changeHandler;
  this.lfoPhaseRow_.onchange = changeHandler;
  this.qRow_.range.onchange = changeHandler;
  this.gainRow_.range.onchange = changeHandler;

  this.setInitialValues_();
  changeHandler();
}

module.UI.prototype.setInitialValues_ = function() {
  this.enabledRow_.setValue(true);
  this.typeRow_.setValue(0);
  this.frequencyRow_.setValue(1.2);
  this.lfoEnabledRow_.setValue(true);
  this.lfoFrequencyRow_.setValue(3);
  this.lfoGainRow_.setValue(0.1);
  this.lfoPhaseRow_.setValue(90);
  this.qRow_.setValue(6);
  this.gainRow_.setValue(10);
}

module.UI.prototype.updateDisplay_ = function() {
  var r = SettingsUIGroup.roundForDisplay;
  this.frequencyRow_.setLabel('x ' + r(this.frequencyRow_.value()));
  this.lfoFrequencyRow_.setLabel(r(this.lfoFrequencyRow_.value()) + ' Hz');
  this.lfoGainRow_.setLabel('+- ' + r(this.lfoGainRow_.value()));
  this.lfoPhaseRow_.setLabel(this.lfoPhaseRow_.value());
  this.qRow_.setLabel(this.qRow_.value());
  this.gainRow_.setLabel(this.gainRow_.value());
}

return module;

})();
