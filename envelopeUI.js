EnvelopeUI = (function() {

"use strict";
var module = {};

var kAttackRowDef = {title: 'Attack', base: 10, minExponent: -2, maxExponent:1, expSteps: 10, includeZero: false};
var kAttackHoldRowDef = {title: 'Attack Hold', base: 10, minExponent: -2, maxExponent:1, expSteps: 10, includeZero: false};
var kDecayRowDef = {title: 'Decay', base: 10, minExponent: -2, maxExponent:1, expSteps: 10, includeZero: false};
var kSustainRowDef = {title: 'Sustain', min: 0, max: 1, steps: 20};
var kSustainHoldRowDef = {title: 'Sustain Hold', base: 10, minExponent: -2, maxExponent:1, expSteps: 10, includeZero: false};
var kReleaseRowDef = {title: 'Release', base: 10, minExponent: -2, maxExponent:1, expSteps: 10, includeZero: false};

module.UI = function(id, instrument, title, categoriesEl, detailsEl, collapsed) {
  this.id = id;
  this.instrument_ = instrument;
  this.title = title;

  this.group_ = new SettingsUI.Group(categoriesEl, detailsEl, 'Envelope', this, collapsed);
  this.attackRow_ = this.group_.addExponentialRangeRow(kAttackRowDef);
  this.attackHoldRow_ = this.group_.addExponentialRangeRow(kAttackHoldRowDef);
  this.decayRow_ = this.group_.addExponentialRangeRow(kDecayRowDef);
  this.sustainRow_ = this.group_.addLinearRangeRow(kSustainRowDef);
  this.sustainHoldRow_ = this.group_.addExponentialRangeRow(kSustainHoldRowDef);
  this.releaseRow_ = this.group_.addExponentialRangeRow(kReleaseRowDef);

  var ui = this;
  var changeHandler = function() {
    ui.instrument_.envelope.attackDelay = 0;
    ui.instrument_.envelope.attack = ui.attackRow_.value();
    ui.instrument_.envelope.attackHold = ui.attackHoldRow_.value();
    ui.instrument_.envelope.decay = ui.decayRow_.value();
    ui.instrument_.envelope.sustain = ui.sustainRow_.value();
    ui.instrument_.envelope.sustainHold = ui.sustainHoldRow_.value();
    ui.instrument_.envelope.release = ui.releaseRow_.value();
    ui.updateDisplay_();
  }
  this.attackRow_.onchange = changeHandler;
  this.attackHoldRow_.onchange = changeHandler;
  this.decayRow_.onchange = changeHandler;
  this.sustainRow_.onchange = changeHandler;
  this.sustainHoldRow_.onchange = changeHandler;
  this.releaseRow_.onchange = changeHandler;
  this.attackRow_.setValue('0.1');
  this.attackHoldRow_.setValue('0.1');
  this.decayRow_.setValue('0.1');
  this.sustainRow_.setValue('0.5');
  this.sustainHoldRow_.setValue('0.01');
  this.releaseRow_.setValue('0.1');
  changeHandler();
}

module.UI.prototype.updateDisplay_ = function() {
  var r = SettingsUI.roundForDisplay;
  this.attackRow_.setLabel(r(this.attackRow_.value()) + ' s');
  this.attackHoldRow_.setLabel(r(this.attackHoldRow_.value()) + ' s');
  this.decayRow_.setLabel(r(this.decayRow_.value()) + ' s');
  this.sustainRow_.setLabel(r(this.sustainRow_.value() * 100) + '%');
  this.sustainHoldRow_.setLabel(r(this.sustainHoldRow_.value()) + ' s');
  this.releaseRow_.setLabel(r(this.releaseRow_.value()) + ' s');
  this.drawEnvelope_();
}

var kBounds = SettingsUI.kDisplayBounds;
var kMid = SettingsUI.kDisplayMid;
var kAxisColor = "#999";
var kEnvelopeStrokeWidth = 2;
var kEnvelopeXPadding = 12.5;
var kEnvelopeYPadding = 5.5;
var kEnvelopeWidth = kBounds.x - 2 * kEnvelopeXPadding;
var kEnvelopeYLow = kEnvelopeYPadding + kEnvelopeStrokeWidth / 2;
var kEnvelopeYHigh = kBounds.y - kEnvelopeYPadding - kEnvelopeStrokeWidth / 2;
var kEnvelopeXStart = kEnvelopeXPadding;
var kEnvelopeColor = "#008000";
var kEnvelopeFillColor = "#90B090";
var kBackgroundColor = "#EEEEEE";
var kBackgroundXPadding = 4;
var kBackgroundYPadding = 5;
var kSustainTime = 0.5;
var kSustainColor = "#008000";
var kSustainFillColor = "#C0EEC0";
var kMinTime = 1;

module.UI.prototype.drawEnvelope_ = function() {
  if (this.background_)
    this.group_.svg.removeChild(this.background_)
  this.background_ = SVGUtils.createRect(kEnvelopeXStart - kBackgroundXPadding,
                                         kEnvelopeYLow - kBackgroundYPadding,
                                         kEnvelopeWidth + kBackgroundXPadding * 2,
                                         kEnvelopeYHigh - kEnvelopeYLow + kBackgroundYPadding * 2,
                                         kBackgroundColor, 0, kBackgroundColor,
                                         this.group_.svgDoc, this.group_.svg);

  if (this.axisX_)
    this.group_.svg.removeChild(this.axisX_);
  this.axisX_ = SVGUtils.createLine(0, kEnvelopeYHigh,
                                    kBounds.x, kEnvelopeYHigh,
                                    kAxisColor, 1,
                                    this.group_.svgDoc, this.group_.svg);

  if (this.axisY_)
    this.group_.svg.removeChild(this.axisY_);
  this.axisY_ = SVGUtils.createLine(kEnvelopeXStart, 0,
                                    kEnvelopeXStart, kBounds.y,
                                    kAxisColor, 1,
                                    this.group_.svgDoc, this.group_.svg);

  if (this.envelope_)
    this.group_.svg.removeChild(this.envelope_);

  var x = kEnvelopeXStart + (kEnvelopeStrokeWidth / 2);
  var totalTime = this.instrument_.envelope.attack +
                  this.instrument_.envelope.attackHold +
                  this.instrument_.envelope.decay +
                  kSustainTime +
                  this.instrument_.envelope.sustainHold +
                  this.instrument_.envelope.release;
  if (totalTime < kMinTime)
    totalTime = kMinTime;
  var xFactor = kEnvelopeWidth / totalTime;
  var ySustain = kEnvelopeYLow + (1 - this.instrument_.envelope.sustain) * (kEnvelopeYHigh - kEnvelopeYLow);

  var points = [];
  SVGUtils.addPointToArray(x, kEnvelopeYHigh, points);
  x += this.instrument_.envelope.attack * xFactor;
  SVGUtils.addPointToArray(x, kEnvelopeYLow, points);
  x += this.instrument_.envelope.attackHold * xFactor;
  SVGUtils.addPointToArray(x, kEnvelopeYLow, points);
  x += this.instrument_.envelope.decay * xFactor;
  SVGUtils.addPointToArray(x, ySustain, points);
  var sustainStart = x;
  x += (this.instrument_.envelope.sustainHold + kSustainTime) * xFactor;
  SVGUtils.addPointToArray(x, ySustain, points);
  x += this.instrument_.envelope.release * xFactor;
  SVGUtils.addPointToArray(x, kEnvelopeYHigh, points);
  this.envelope_ = SVGUtils.createPolyLine(points,
                                           kEnvelopeColor, kEnvelopeStrokeWidth,
                                           kEnvelopeFillColor,
                                           this.group_.svgDoc, this.group_.svg);

  if (this.sustainFill_)
    this.group_.svg.removeChild(this.sustainFill_);

  this.sustainFill_ = SVGUtils.createRect(sustainStart, ySustain,
                                          kSustainTime * xFactor,
                                          kEnvelopeYHigh - ySustain,
                                          kSustainFillColor, 0, kSustainFillColor,
                                          this.group_.svgDoc, this.group_.svg);

  if (this.sustain_)
    this.group_.svg.removeChild(this.sustain_);
  this.sustain_ = SVGUtils.createLine(sustainStart, ySustain,
                                      sustainStart + kSustainTime * xFactor, ySustain,
                                      kSustainColor, kEnvelopeStrokeWidth,
                                      this.group_.svgDoc, this.group_.svg);
}

return module;

})();
