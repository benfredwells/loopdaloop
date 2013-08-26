CategoryUI = (function() {

"use strict";
var module = {};

var kTimeSteps = 100;

module.CategoryVisualizer = function(container, displaySettings, onchange) {
  SettingsUI.Panel.call(this, container);
  this.div.classList.add('categoryDisplay');
  this.svg = new SVGUI.SVGControl(this);

  var visualizer = this;
  function changeHandler() {
    if (visualizer.onchange)
      visualizer.onchange();
  }

  this.timeRange = document.createElement('input');
  this.timeRange.type = 'range';
  this.timeRange.min = 0;
  this.timeRange.max = kTimeSteps;
  this.timeRange.value = 0;
  this.timeRange.onchange = changeHandler;
  this.div.appendChild(this.timeRange);

  this.timeLabel = document.createElement('span');
  this.div.appendChild(this.timeLabel);

  this.displaySettings = displaySettings;
  this.onchange = onchange;

  this.xSize = 200;
  this.ySize = 50;
}

module.CategoryVisualizer.prototype = Object.create(SettingsUI.Panel.prototype);

var kBackgroundStroke = "#CCCCCC";
var kBackgroundStrokeWidth = 2;
var kBackgroundFill = "none";
var kTimePadding = 4;
var kTimeY = 15;
var kTimeSize = 12;
var kTimeTextColor = "#888888";
var kTimeAnchor = "end";

module.CategoryVisualizer.prototype.drawVisualization = function() {
  this.svg.clear();
  this.svg.drawRect(0, 0, this.xSize, this.ySize, kBackgroundStroke, kBackgroundStrokeWidth, kBackgroundFill);
}

module.CategoryVisualizer.prototype.drawTime = function() {
  var timeString = Strings.kSecondsFormatter.format(this.currentTime());
  this.svg.drawText(timeString, this.xSize - kTimePadding, kTimeY, kTimeAnchor, kTimeTextColor, kTimeSize);
}

module.CategoryVisualizer.prototype.currentTime = function() {
  var rangeVal = this.timeRange.value;
  return (rangeVal / kTimeSteps) * (this.displaySettings.noteOnTimeSetting.value +
                                    this.displaySettings.releaseTimeSetting.value);
}

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