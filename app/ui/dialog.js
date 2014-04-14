"use strict";

var Dialog = (function() {

var module= {};

var DialogControl = function(container) {
  UI.Control.call(this, container);

  this.div.classList.add('dialogDiv');
};

DialogControl.prototype = Object.create(UI.Control.prototype);

var BaseDialog = function(oncancel) {
  this.oncancel = oncancel;
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
  // Child classes implement this.
}

BaseDialog.prototype.layout_ = function() {
  var caption = new UI.Control(this.mainControl);
  caption.div.classList.add('dialogRow');
  caption.div.innerHTML = 'Dialog';
  this.addContent();

  var dialog = this;

  var doOK = function(event) { dialog.handleOK_(); };
  this.ok = new UI.Button(this.mainControl, doOK, 'OK');
  this.ok.div.classList.add('dialogButton');

  var doCancel = function(event) { dialog.handleCancel_(); }
  this.cancel = new UI.Button(this.mainControl, doCancel, 'Cancel');
  this.cancel.div.classList.add('dialogButton');
}

BaseDialog.prototype.handleOK_ = function() {
  // Child classes implement this.
}

BaseDialog.prototype.handleCancel_ = function() {
  this.hide();
  if (this.oncancel)
    this.oncancel();
}

module.EnterTextDialog = function(oncancel) {
  BaseDialog.call(this, oncancel);
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