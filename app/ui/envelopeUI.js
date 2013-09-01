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

module.UI.prototype.setTime = function(time) {
  this.contourPanel.setCurrentTime(time);
  this.contourPanel.drawContour();
}

return module;

})();
