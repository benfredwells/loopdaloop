"use strict";

var Dialog = (function() {

var module= {};

module.BaseDialog = function(parentDocument) {
  this.background_ = parentDocument.getElementById('dialogBackground');
};

module.BaseDialog.prototype.show = function() {
  this.background_.style.visibility = "visible";
};

module.BaseDialog.prototype.hide = function() {
  this.background_.style.visibility = "hidden";
};

return module;

})();