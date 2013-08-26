CategoryUI = (function() {

"use strict";
var module = {};

module.CategoryVisualizer = function(container) {
  SettingsUI.Panel.call(this, container);
  this.div.classList.add('categoryDisplay');
  this.svg = new SVGUI.SVGControl(this);

  var range = document.createElement('input');
  range.type = 'range';
  range.min = 0;
  range.max = 100;
  this.div.appendChild(range);
}

module.CategoryVisualizer.prototype = Object.create(SettingsUI.Panel.prototype);

module.CategoryVisualizer.prototype.drawVisualization = function() {}

module.UI = function(id, title, categoriesEl, detailsEl, selected) {
  this.id = id;
  this.title = title;

  this.categoryEl_ = document.createElement('div');
  this.categoryEl_.classList.add('category');
  categoriesEl.appendChild(this.categoryEl_);

  this.categoryIconEl_ = document.createElement('div');
  this.categoryIconEl_.classList.add('categoryIcon');
  this.categoryEl_.appendChild(this.categoryIconEl_);

  this.titleRow = new SettingsUI.Row(detailsEl, title, null);
  this.titleRow.label.classList.add('categoryName');
  this.settings = new SettingsUI.Panel(detailsEl);

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
}

module.UI.prototype.setSelected = function(selected) {
  if (selected)
    this.categoryEl_.classList.add('selected');
  else
    this.categoryEl_.classList.remove('selected');
  this.titleRow.setVisible(selected);
  this.settings.setVisible(selected);
}

module.UI.prototype.isSelected = function() {
  return this.settings.isVisible();
}

module.UI.prototype.setIconClass = function(iconClass) {
  for (var i = this.categoryIconEl_.classList.length-1; i >= 0; i--) {
    var className = this.categoryIconEl_.classList.item(i);
    if (className != 'categoryIcon' && className.indexOf('Icon') != -1)
      this.categoryIconEl_.classList.remove(className);
  }
  this.categoryIconEl_.classList.add(iconClass);
}

return module;

})();