PitchUI = (function() {

"use strict";
var module = {};

module.UI = function(id, pitchContour, instrument, title, categoriesEl, detailsEl, ontimechange) {
  CategoryUI.UI.call(this, id, title, categoriesEl, detailsEl, true);
  this.pitchContour_ = pitchContour;

  var ui = this;
  function changeHandler() {
    if (ontimechange)
      ontimechange(ui.contourPanel.currentTime());
  }
  var sizeChangeHandler = function() {
    if (ui.onsizechange)
      ui.onsizechange(ui);
  }
  this.contourPanel = new ContourUI.ContourPanel(this.settings, Strings.kPitch,
                                                 changeHandler, sizeChangeHandler, pitchContour,
                                                 instrument, null, 240, true, true);
  this.setIconClass('pitchIcon');
}

module.UI.prototype = Object.create(CategoryUI.UI.prototype);

module.UI.prototype.setSelected = function(selected) {
  CategoryUI.UI.prototype.setSelected.call(this, selected);
  if (selected) {
    this.contourPanel.drawContour();
  }
}

module.UI.prototype.setCurrentTime = function(time, noteDuration, releaseTime) {
  this.contourPanel.setCurrentTime(time, noteDuration, releaseTime);
  if (this.isSelected())
    this.contourPanel.drawContour();
}

return module;

})();
