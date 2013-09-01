EnvelopeUI = (function() {

"use strict";
var module = {};

module.UI = function(id, envelopeContour, instrument, title, categoriesEl, detailsEl, selected, ontimechange) {
  CategoryUI.UI.call(this, id, title, categoriesEl, detailsEl, true, selected);
  this.envelopeContour_ = envelopeContour;

  this.contourPanel = new ContourUI.ContourPanel(this.settings, Strings.kEnvelope,
                                                 null, envelopeContour,
                                                 instrument, null, 190, true, true);
  this.setIconClass('envelopeIcon');
}

module.UI.prototype = Object.create(CategoryUI.UI.prototype);

module.UI.prototype.setSelected = function(selected) {
  CategoryUI.UI.prototype.setSelected.call(this, selected);
  // Bail out if still initializing
  if (!this.contourPanel)
    return;

  if (selected) {
    this.contourPanel.drawContour();
  }
}

module.UI.prototype.setTime = function(time) {
  this.contourPanel.setCurrentTime(time);
  if (this.isSelected())
    this.contourPanel.drawContour();
}

return module;

})();
