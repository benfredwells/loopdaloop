SettingsUIGroup = (function() {

"use strict";
var module = {};

module.Group = function(parent, title) {
  this.heading_ = document.createElement('div');
  this.heading_.classList.add('instrSettingHeading');
  this.heading_.innerHTML = title;
  parent.appendChild(this.heading_);

  this.display_ = document.createElement('div');
  this.display_.classList.add('instrDisplay');
  this.heading_.appendChild(this.display_);

  this.details_ = document.createElement('div');
  this.details_.classList.add('instrSettingDetails');
  parent.appendChild(this.details_);

  var ui = this;
  this.heading_.onclick = function() {
    ui.details_.hidden = !ui.details_.hidden;
  }
}

module.Group.prototype.addSelectRow = function(title, array) {
  var row = document.createElement('div');
  row.classList.add('instrSettingRow');
  this.details_.appendChild(row);

  var label = document.createElement('div');
  label.classList.add('instrSettingDescr');
  label.innerHTML = 'Type';
  row.appendChild(label);

  var setting = document.createElement('div');
  setting.classList.add('instrSetting');
  row.appendChild(setting);

  var select = document.createElement('select');
  setting.appendChild(select);
  for (var i = 0; i < array.length; i++) {
    var option = document.createElement('option');
    option.value = i;
    option.text = array[i];
    select.add(option, null);
  }

  return select;
}

return module;

})();
