CategoryUI = (function() {

"use strict";
var module = {};

module.UI = function(id, title, categoriesEl, detailsEl, selected) {
  this.id = id;
  this.title = title;

  this.categoryEl_ = document.createElement('div');
  this.categoryEl_.classList.add('synthCategory');
  categoriesEl.appendChild(this.categoryEl_);

  this.categoryIconEl_ = document.createElement('div');
  this.categoryIconEl_.classList.add('synthCategoryIcon');
  this.categoryEl_.appendChild(this.categoryIconEl_);

  this.settings = new SettingsUI.Group(detailsEl);

  this.setSelected(selected);

  var ui = this;
  this.categoryEl_.onclick = function() {
    if (ui.isSelected())
      return;
    ui.setSelected(true);
    if (ui.onclicked)
      ui.onclicked(ui);
  }

  this.categoryEl_.onmouseenter = function() {
    ui.categoryEl_.classList.add('hover');
  }

  this.categoryEl_.onmouseleave = function() {
    ui.categoryEl_.classList.remove('hover');
  }

//  this.svgDoc = document;
//  this.svg = SVGUtils.createSVG(this.svgDoc, this.display_);
}

module.UI.prototype.setSelected = function(selected) {
  if (selected)
    this.categoryEl_.classList.add('selected');
  else
    this.categoryEl_.classList.remove('selected');
  this.settings.setVisible(selected);
}

module.UI.prototype.isSelected = function() {
  return this.settings.isVisible();
}

module.UI.prototype.setIconClass = function(iconClass) {
  for (var i = this.categoryIconEl_.classList.length-1; i >= 0; i--) {
    var className = this.categoryIconEl_.classList.item(i);
    if (className != 'synthCategoryIcon' && className.indexOf('Icon') != -1)
      this.categoryIconEl_.classList.remove(className);
  }
  this.categoryIconEl_.classList.add(iconClass);
}

return module;

})();