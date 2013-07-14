FilterUI = (function() {

"use strict";
var module = {};

var kFilterCaptions = ['Low pass', 'High pass', 'Band pass', 'Low shelf',
                       'High shelf', 'Peaking', 'Notch', 'All pass'];
var kFilterValues = ['lowpass', 'highpass', 'bandpass', 'lowshelf', 'highshelf',
                    'peaking', 'notch', 'allpass'];
var kFilterHasGain = [false, false, false, true, true, true, false, false];

var kTypeRowDef = {title: 'Type', captions: kFilterCaptions, values: kFilterValues};
var kFrequencyControllerDef = {title: 'Frequency', indent: 1, min: 0.5, max: 10, steps: 190, prefix: 'x', suffix:''};
var kQRowDef = {title: 'Q', min: 0, max: 20, steps: 20};
var kGainRowDef = {title: 'Gain', min: -20, max: 20, steps: 40};

module.UI = function(id, filter, title, categoryEl, detailsEl, collapsed) {
  this.id = id;
  this.filter_ = filter;
  this.title = title;

  this.group_ = new SettingsUI.Group(categoryEl, detailsEl, title, this, collapsed);
  var s = SettingsUI.makeSubRow;
  var ss = SettingsUI.makeSubSubRow;
  var g = this.group_;

  this.enabledRow_ = g.addCheckRow(Strings.kEnabled, filter.enabled);
  this.typeRow_ = s(g.addSelectRow(kTypeRowDef));
  this.frequencyController_ = new ContourUI.ContourController(g, kFrequencyControllerDef, filter.frequency);
  this.qRow_ = s(g.addLinearRangeRow(kQRowDef));
  this.gainRow_ = s(g.addLinearRangeRow(kGainRowDef));

  var ui = this;
  var changeHandler = function  () {
    ui.filter_.type = ui.typeRow_.value();
    ui.filter_.q = ui.qRow_.value();
    ui.filter_.gain = ui.gainRow_.value();
    ui.updateDisplay_();
  }

  this.setInitialValues_();
  this.response_ = [];
  changeHandler();

  this.enabledRow_.onchange = changeHandler;
  this.typeRow_.onchange = changeHandler;
  this.frequencyController_.onchange = changeHandler;
  this.qRow_.onchange = changeHandler;
  this.gainRow_.onchange = changeHandler;
}

module.UI.prototype.setInitialValues_ = function() {
  this.typeRow_.setValue('lowpass');
  this.qRow_.setValue(6);
  this.gainRow_.setValue(10);
}

module.UI.prototype.updateDisplay_ = function() {
  var r = SettingsUI.roundForDisplay;
  this.qRow_.setLabel(this.qRow_.value());
  this.gainRow_.setLabel(this.gainRow_.value() + ' dB');
  this.enableDisable_();
  this.drawResponse_();
}

module.UI.prototype.enableDisable_ = function() {
  var enabled = this.filter_.enabled.value;
  var gainEnabled = enabled && kFilterHasGain[this.typeRow_.value()];
  this.typeRow_.enableDisable(enabled);
  this.frequencyController_.enableDisable(enabled);
  this.qRow_.enableDisable(enabled);
  this.gainRow_.enableDisable(gainEnabled);
}

var kBounds = SettingsUI.kDisplayBounds;
var kMid = SettingsUI.kDisplayMid;
var kXPadding = 12.5;
var kXRange = kBounds.x - (2 * kXPadding);
var kMaxMagPadding = 1;
var kMinMag = -20;
var kFreqStart = 200;
var kFreqEnd = 5000;
var kFreqOctave = 4;
var kFreqNote = 0;
var kAxisColor = "#999";
var kAxisWidth = 1;
var kOddHarmonicColor = "#BBB";
var kEvenHarmonicColor = "#AAA";
var kResponseColor = "#008000";
var kResponseWidth = 2;
var kResponseFlat = "#90B090";
var kPhaseWidth = 1;
var kPhaseColor = "magenta";

module.UI.prototype.drawBackground_ = function(response, xAxisY) {
  this.response_.push(SVGUtils.createLine(0, xAxisY + 0.5,
                                          kBounds.x, xAxisY + 0.5,
                                          kAxisColor, kAxisWidth,
                                          this.group_.svgDoc, this.group_.svg));
  this.response_.push(SVGUtils.createLine(kXPadding, 0,
                                          kXPadding, kBounds.y,
                                          kAxisColor, kAxisWidth,
                                          this.group_.svgDoc, this.group_.svg));
  for (var i = 0; i < response.numHarmonics; i++) {
    var noteIndex = response.harmonics[i];
    var color = kEvenHarmonicColor;
    if (i % 2 == 1)
      color = kOddHarmonicColor;
    this.response_.push(SVGUtils.createLine(kXPadding + noteIndex, 0,
                                            kXPadding + noteIndex, kBounds.y,
                                            color, kAxisWidth,
                                            this.group_.svgDoc, this.group_.svg));
  }
}

function gainToDB(gain) {
  // 10dB = gain of 2 (is that right? or is it 20?)
  // so db = logbase2(gain) * 10
  return 10 * Math.log(gain) / Math.log(2);
}

module.UI.prototype.drawResponse_ = function() {
  var ui = this;
  this.response_.forEach(function(child) {
    ui.group_.svg.removeChild(child);
  });
  this.response_ = [];
  if (!this.filter_.enabled)
    return;

  var magPoints = [];
  var phasePoints = [];
  var response = this.filter_.getFrequencyResponse(kFreqOctave,
                                                   kFreqNote,
                                                   kFreqStart,
                                                   kFreqEnd,
                                                   kXRange);
  var maxMag = gainToDB(response.maxMag) + kMaxMagPadding;
  var magRange = maxMag - kMinMag;
  for (var i = 0; i < response.mag.length; i++) {
    var x = kXPadding + i;
    var magY = kBounds.y * (maxMag - gainToDB(response.mag[i])) / magRange;
    SVGUtils.addPointToArray(x, magY, magPoints);
    var phaseY = kBounds.y * (Math.PI - response.phase[i]) / (2 * Math.PI);
    SVGUtils.addPointToArray(x, phaseY, phasePoints);
  }
  var xAxisY = kBounds.y * maxMag / magRange;
  SVGUtils.addPointToArray(kBounds.x - kXPadding, kBounds.y, magPoints);
  SVGUtils.addPointToArray(kXPadding, kBounds.y, magPoints);
  this.response_.push(SVGUtils.createPolyLine(magPoints,
                                              "none", 0, kResponseFlat,
                                              this.group_.svgDoc, this.group_.svg));
  this.drawBackground_(response, xAxisY);
  this.response_.push(SVGUtils.createLine(kXPadding + response.filterIndex, 0,
                                          kXPadding + response.filterIndex, kBounds.y,
                                          kResponseColor, kAxisWidth,
                                          this.group_.svgDoc, this.group_.svg));
  magPoints.pop();
  magPoints.pop();
  this.response_.push(SVGUtils.createPolyLine(magPoints,
                                              kResponseColor, kResponseWidth, "none",
                                              this.group_.svgDoc, this.group_.svg));
  this.response_.push(SVGUtils.createPolyLine(phasePoints,
                                              kPhaseColor, kPhaseWidth, "none",
                                              this.group_.svgDoc, this.group_.svg));
}

return module;

})();
