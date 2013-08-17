EnvelopeUI = (function() {

"use strict";
var module = {};

module.UI = function(id, envelopeContour, title, categoriesEl, detailsEl, selected) {
  CategoryUI.UI.call(this, id, title, categoriesEl, detailsEl, selected);
  this.envelopeContour_ = envelopeContour;

  var ui = this;
  var changeHandler = function() {
    ui.updateDisplay_();
  }
  new ContourUI.ContourPanel(this.settings, Strings.kEnvelope,
                             changeHandler, envelopeContour,
                             null, 190);
  this.setIconClass('envelopeIcon');
  changeHandler();
}

module.UI.prototype = Object.create(CategoryUI.UI.prototype);

module.UI.prototype.updateDisplay_ = function() {
  //this.drawEnvelope_();
}

/*

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

  // TODO: draw all envelope types.
  return;

  if (this.envelope_)
    this.group_.svg.removeChild(this.envelope_);

  var x = kEnvelopeXStart + (kEnvelopeStrokeWidth / 2);
  var totalTime = this.instrument_.envelope.attackTime +
                  this.instrument_.envelope.attackHold +
                  this.instrument_.envelope.decayTime +
                  kSustainTime +
                  this.instrument_.envelope.sustainHold +
                  this.instrument_.envelope.releaseTime;
  if (totalTime < kMinTime)
    totalTime = kMinTime;
  var xFactor = kEnvelopeWidth / totalTime;
  var ySustain = kEnvelopeYLow + (1 - this.instrument_.envelope.sustainValue) * (kEnvelopeYHigh - kEnvelopeYLow);

  var points = [];
  SVGUtils.addPointToArray(x, kEnvelopeYHigh, points);
  x += this.instrument_.envelope.attackTime * xFactor;
  SVGUtils.addPointToArray(x, kEnvelopeYLow, points);
  x += this.instrument_.envelope.attackHold * xFactor;
  SVGUtils.addPointToArray(x, kEnvelopeYLow, points);
  x += this.instrument_.envelope.decayTime * xFactor;
  SVGUtils.addPointToArray(x, ySustain, points);
  var sustainStart = x;
  x += (this.instrument_.envelope.sustainHold + kSustainTime) * xFactor;
  SVGUtils.addPointToArray(x, ySustain, points);
  x += this.instrument_.envelope.releaseTime * xFactor;
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
*/

return module;

})();
