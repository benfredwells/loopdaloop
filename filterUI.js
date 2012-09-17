FilterUI = (function() {

"use strict";
var module = {};

var kFilterTypes = ['LOWPASS', 'HIGHPASS', 'BANDPASS', 'LOWSHELF', 'HIGHSHELF',
                    'PEAKING', 'NOTCH', 'ALLPASS'];
var kFilterHasGain = [false, false, false, true, true, true, false, false];

module.UI = function(instrument, element) {
  this.instrument_ = instrument;

  var s = SettingsUI.makeSubRow;
  var ss = SettingsUI.makeSubSubRow;
  this.group_ = new SettingsUI.Group(element, 'Filter');
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
    ui.instrument_.filter.enabled = ui.enabledRow_.check.value;
    ui.instrument_.filter.type = ui.typeRow_.select.value;
    ui.instrument_.filter.frequencyFactor = ui.frequencyRow_.value();
    ui.instrument_.filter.lfo.enabled = ui.lfoEnabledRow_.value();
    ui.instrument_.filter.lfo.frequencyFactor = ui.lfoFrequencyRow_.value();
    ui.instrument_.filter.lfo.phase = 2 * Math.PI * ui.lfoPhaseRow_.value() / 360;
    ui.instrument_.filter.lfo.gain = ui.lfoGainRow_.value();
    ui.instrument_.filter.q = ui.qRow_.value();
    ui.instrument_.filter.gain = ui.gainRow_.value();
    ui.updateDisplay_();
  }
  this.enabledRow_.onchange = changeHandler;
  this.typeRow_.onchange = changeHandler;
  this.frequencyRow_.onchange = changeHandler;
  this.lfoEnabledRow_.onchange = changeHandler;
  this.lfoFrequencyRow_.onchange = changeHandler;
  this.lfoGainRow_.onchange = changeHandler;
  this.lfoPhaseRow_.onchange = changeHandler;
  this.qRow_.onchange = changeHandler;
  this.gainRow_.onchange = changeHandler;

  this.setInitialValues_();
  this.response_ = [];
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
  var r = SettingsUI.roundForDisplay;
  this.frequencyRow_.setLabel('x ' + r(this.frequencyRow_.value()));
  this.lfoFrequencyRow_.setLabel(r(this.lfoFrequencyRow_.value()) + ' Hz');
  this.lfoGainRow_.setLabel('+- ' + r(this.lfoGainRow_.value()));
  this.lfoPhaseRow_.setLabel(this.lfoPhaseRow_.value());
  this.qRow_.setLabel(this.qRow_.value());
  this.gainRow_.setLabel(this.gainRow_.value() + ' dB');
  this.enableDisable_();
  this.drawResponse_();
}

module.UI.prototype.enableDisable_ = function() {
  var enabled = this.enabledRow_.value();
  var lfoEnabled = enabled && this.lfoEnabledRow_.value();
  var gainEnabled = enabled && kFilterHasGain[this.typeRow_.value()];
  this.typeRow_.enableDisable(enabled);
  this.frequencyRow_.enableDisable(enabled);
  this.qRow_.enableDisable(enabled);
  this.gainRow_.enableDisable(gainEnabled);
  this.lfoEnabledRow_.enableDisable(enabled);
  this.lfoFrequencyRow_.enableDisable(lfoEnabled);
  this.lfoGainRow_.enableDisable(lfoEnabled);
  this.lfoPhaseRow_.enableDisable(lfoEnabled);
}

var kBounds = SettingsUI.kDisplayBounds;
var kMid = SettingsUI.kDisplayMid;
var kXPadding = 12.5;
var kYPadding = 9.5;
var kXRange = kBounds.x - (2 * kXPadding);
var kYRange = kBounds.y - (2 * kYPadding);
var kYMaxMag = 2;
var kFreqStart = 10;
var kFreqEnd = 15000;
var kAxisColor = "#999";
var kResponseColor = "blue";
var kResponseWidth = 2;
var kResponseFill = "#E0EAFF";

module.UI.prototype.drawBackground_ = function() {
  this.response_.push(SVGUtils.createLine(0, kBounds.y - kYPadding,
                                          kBounds.x, kBounds.y - kYPadding,
                                          kAxisColor, 1,
                                          this.group_.svgDoc, this.group_.svg));
  this.response_.push(SVGUtils.createLine(kXPadding, 0,
                                          kXPadding, kBounds.y,
                                          kAxisColor, 1,
                                          this.group_.svgDoc, this.group_.svg));
}

module.UI.prototype.drawResponse_ = function() {
  var points = [];
  var response = this.instrument_.filter.getFrequencyResponse(kFreqStart, kFreqEnd, kXRange);
  for (var i = 0; i < response.mag.length; i++) {
    var x = kXPadding + i;
    var y = kYPadding + (kYRange * (1 - response.mag[i] / kYMaxMag));
    SVGUtils.addPointToArray(x, y, points);
  }
  var ui = this;
  this.response_.forEach(function(child) {
    ui.group_.svg.removeChild(child)
  });
  this.response_ = [];
  SVGUtils.addPointToArray(kBounds.x - kXPadding, kBounds.y - kYPadding, points);
  SVGUtils.addPointToArray(kXPadding, kBounds.y - kYPadding, points);
  this.response_.push(SVGUtils.createPolyLine(points,
                                              "none", 0, kResponseFill,
                                              this.group_.svgDoc, this.group_.svg));
  this.drawBackground_();
  points.pop();
  points.pop();
  this.response_.push(SVGUtils.createPolyLine(points,
                                              kResponseColor, kResponseWidth, "none",
                                              this.group_.svgDoc, this.group_.svg));
}

return module;

})();
