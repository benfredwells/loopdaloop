"use strict";

var ErrorUI = (function() {

var module = {};

module.UI = function(parentDiv, onchange) {
  UI.Control.call(this, parentDiv);
  this.div.id = 'errorDisplay';
  this.onchange_ = onchange;
  this.errorText_ = '';
  this.updateErrorText('Hey');
  this.updateErrorTextCallback = this.updateErrorText_.bin(this);
};

module.UI.prototype = Object.create(UI.Control.prototype);

module.UI.prototype.updateVisible_ = function() {
  this.setVisible(this.errorText_ !== '');
};

module.UI.prototype.updateErrorText_ = function(errorText) {
  this.errorText_ = errorText;
  this.div.innerHTML = this.errorText_;
  this.updateVisible_();
};

module.UI.prototype.height = function() {
  return this.div.clientHeight;
};

return module;

})();