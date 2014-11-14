CategoryUI = (function() {

"use strict";
var module = {};

var kTimeSteps = 100;

module.CategoryVisualizer = function(container, ontimechange) {
  UI.Panel.call(this, container);
  this.div.classList.add('categoryDisplay');
  this.svg = new SVGUI.SVGControl(this);

  var visualizer = this;
  function changeHandler() {
    visualizer.currentTime_ = visualizer.currentTimeFromRange_();
    if (visualizer.ontimechange)
      visualizer.ontimechange(visualizer.currentTime());
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

  this.ontimechange = ontimechange;

  this.xSize = UIConstants.visualizationWidth;
  this.ySize = 50;

  this.noteDuration = 0;
  this.releaseTime = 0;
  this.currentTime_ = 0;
}

module.CategoryVisualizer.prototype = Object.create(UI.Panel.prototype);

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
  var timeString = Strings.kSecondsFormatter.format(this.currentTime().toFixed(2));
  this.svg.drawText(timeString, this.xSize - kTimePadding, kTimeY, kTimeAnchor, kTimeTextColor, kTimeSize);
}

module.CategoryVisualizer.prototype.currentTime = function() {
  return this.currentTime_;
}

module.CategoryVisualizer.prototype.currentTimeFromRange_ = function() {
  var rangeVal = this.timeRange.value;
  return (rangeVal / kTimeSteps) * (this.noteDuration + this.releaseTime);
}

module.CategoryVisualizer.prototype.setCurrentTime = function(time, noteDuration, releaseTime) {
  this.noteDuration = noteDuration;
  this.releaseTime = releaseTime;
  this.timeRange.value = kTimeSteps * time / (this.noteDuration + this.releaseTime);
  this.currentTime_ = time;
}

module.UI = function(id, title, categoriesEl, detailsEl, hideTitle) {
  this.id = id;
  this.title = title;

  this.categoryEl = document.createElement('div');
  this.categoryEl.classList.add('category');
  categoriesEl.appendChild(this.categoryEl);

  this.categoryIconEl_ = document.createElement('div');
  this.categoryIconEl_.classList.add('categoryIcon');
  this.categoryEl.appendChild(this.categoryIconEl_);

  if (!hideTitle) {
    this.titleRow = new SettingsUI.Row(detailsEl, title, null);
    this.titleRow.label.classList.add('categoryName');
  }
  this.settings = new UI.Panel(detailsEl);

  this.hideTitle_ = hideTitle;
  this.setSelected(false);

  var ui = this;
  this.categoryEl.onclick = function() {
    if (ui.isSelected())
      return;
    ui.setSelected(true);
    if (ui.onselect)
      ui.onselect(ui);
  }

  this.categoryEl.onmouseenter = function() {
    ui.categoryEl.classList.add('hover');
  }

  this.categoryEl.onmouseleave = function() {
    ui.categoryEl.classList.remove('hover');
  }
}

module.UI.prototype.setSelected = function(selected) {
  if (selected)
    this.categoryEl.classList.add('selected');
  else
    this.categoryEl.classList.remove('selected');

  if (!this.hideTitle_)
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

module.UI.prototype.setCurrentTime = function(time, noteDuration, releaseTime) {
}

module.UI.prototype.height = function() {
  if (!this.isSelected())
    return 0;

  var result = this.settings.div.clientHeight;
  if (!this.hideTitle_)
    result = result + this.titleRow.div.clientHeight;
  return result;
}

module.UI.prototype.updateIcon = function() {
  // By default do nothing.
}

module.UI.prototype.updateDisplay = function() {
  this.updateIcon();
  this.settings.updateDisplay();
}

return module;

})();