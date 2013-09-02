EnvelopeUI = (function() {

"use strict";
var module = {};

module.UI = function(id, envelopeContour, instrument, title, categoriesEl, detailsEl, ontimechange) {
  CategoryUI.UI.call(this, id, title, categoriesEl, detailsEl, true);
  this.envelopeContour_ = envelopeContour;

  var ui = this;
  function changeHandler() {
    if (ontimechange)
      ontimechange(ui.contourPanel.currentTime());
  }
  this.contourPanel = new ContourUI.ContourPanel(this.settings, Strings.kEnvelope,
                                                 changeHandler, envelopeContour,
                                                 instrument, null, 190, true, true);
  this.setIconClass('envelopeIcon');
}

module.UI.prototype = Object.create(CategoryUI.UI.prototype);

module.UI.prototype.setSelected = function(selected) {
  CategoryUI.UI.prototype.setSelected.call(this, selected);
  if (selected) {
    this.contourPanel.drawContour();
  }
}

module.UI.prototype.setCurrentTime = function(time, noteOnTime, releaseTime) {
  this.contourPanel.setCurrentTime(time, noteOnTime, releaseTime);
  if (this.isSelected())
    this.contourPanel.drawContour();
}

return module;

})();
