"use strict";

var Dialog = (function() {

var module= {};

var DialogControl = function(container) {
  UI.Control.call(this, container);

  this.div.classList.add('dialogDiv');
};

DialogControl.prototype = Object.create(UI.Control.prototype);

var BaseDialog = function() {
  this.background_ = document.getElementById('dialogBackground');
  this.holder_ = document.getElementById('dialogHolder');
  this.mainControl = new DialogControl(this.holder_);
  this.mainControl.hidden = true;
  this.layout_();
};

BaseDialog.prototype.show = function() {
  this.background_.style.visibility = "visible";
  this.holder_.style.visibility = "visible";
  this.mainControl.hidden = false;
};

BaseDialog.prototype.hide = function() {
  this.background_.style.visibility = "hidden";
  this.holder_.style.visibility = "hidden";
  this.mainControl.hidden = true;
};

BaseDialog.prototype.addContent = function() {
  // Overridden classes implement this.
}
BaseDialog.prototype.layout_ = function() {
  var caption = new UI.Control(this.mainControl);
  caption.div.classList.add('dialogRow');
  caption.div.innerHTML = 'Dialog';
  this.addContent();
  this.ok = new UI.Button(this.mainControl, null, 'OK');
  this.ok.div.classList.add('dialogButton');
  this.cancel = new UI.Button(this.mainControl, null, 'Cancel');
  this.cancel.div.classList.add('dialogButton');
}

module.EnterTextDialog = function() {
  BaseDialog.call(this);
}

module.EnterTextDialog.prototype = Object.create(BaseDialog.prototype);

module.EnterTextDialog.prototype.addContent = function() {
  var textEditRow = new UI.Control(this.mainControl);
  textEditRow.div.classList.add('dialogRow');
  this.textEdit_ = document.createElement('input');
  this.textEdit_.classList.add('dialogElement');
  textEditRow.div.appendChild(this.textEdit_);
}

return module;

})();