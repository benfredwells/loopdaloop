"use strict";

var Dialog = (function() {

var module= {};

var DialogDiv = function(container) {
  UI.Control.call(this, container);

  this.div.classList.add('dialogDiv');
};

DialogDiv.prototype = Object.create(UI.Control.prototype);

module.BaseDialog = function() {
  this.background_ = document.getElementById('dialogBackground');
  this.holder_ = document.getElementById('dialogHolder');
  this.div = new DialogDiv(this.holder_);
  this.div.hidden = true;
};

module.BaseDialog.prototype.show = function() {
  this.background_.style.visibility = "visible";
  this.holder_.style.visibility = "visible";
  this.div.hidden = false;
};

module.BaseDialog.prototype.hide = function() {
  this.background_.style.visibility = "hidden";
  this.holder_.style.visibility = "hidden";
  this.div.hidden = true;
};

return module;

})();