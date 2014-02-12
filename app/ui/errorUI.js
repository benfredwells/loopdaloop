"use strict";

var ErrorUI = (function() {

var module = {};

module.UI = function(parentDiv, onchange) {
  UI.Control.call(this, parentDiv);
  this.div.id = 'errorDisplay';
  this.onchange_ = onchange;
  this.errorText_ = '';
  this.updateErrorText_('');
  this.updateErrorTextCallback = this.updateErrorText_.bind(this);
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

var kHeightFudge = -4;

module.UI.prototype.height = function() {
  var result = this.div.clientHeight;
  if (result > 0)
    result = result + kHeightFudge;

  return result;
};

return module;

})();