EnvelopeUI = (function() {

"use strict";
var module = {};

module.UI = function(id, envelopeContour, instrument, title, categoriesEl, detailsEl, selected) {
  CategoryUI.UI.call(this, id, title, categoriesEl, detailsEl, selected);
  this.envelopeContour_ = envelopeContour;

  new ContourUI.ContourPanel(this.settings, Strings.kEnvelope,
                             null, envelopeContour,
                             instrument, null, 190);
  this.setIconClass('envelopeIcon');
  changeHandler();
}

module.UI.prototype = Object.create(CategoryUI.UI.prototype);

return module;

})();
