CategoriesUI = (function(){

"use strict";
var module = {};

var kPitchID = 'pitch';
var kOscillatorAID = 'oscillatora';
var kOscillatorBID = 'oscillatorb';
var kOscillatorCID = 'oscillatorc';
var kFilterAID = 'fitlera';
var kFilterBID = 'filterb';
var kEnvelopeID = 'envelope';

module.kDefaultCategoryID = kOscillatorAID;

module.UI = function(categoriesEl, detailsEl, instrument, scene, initialLastNoteDuration,
                     onvisualizationtimechange, onselectedcategorychange, oncategorysizechange) {
  // TODO: make private things private.
  this.categoriesEl = categoriesEl;
  this.detailsEl = detailsEl;
  this.instrument = instrument;
  this.scene = scene;
  this.onvisualizationtimechange = onvisualizationtimechange;
  this.onselectedcategorychange = onselectedcategorychange;
  this.oncategorysizechange = oncategorysizechange;

  this.categoriesEl.tabIndex = 0;
  this.categories = [];
  this.createCategories_(initialLastNoteDuration);
  this.createCategoryIndicator_();
};

module.UI.prototype.createCategoryUI_ = function(constructor, aspect, id, title, initialLastNoteDuration) {
  var ui = new constructor(id, aspect, this.scene.context, this.instrument,
                           title, this.categoriesEl, this.detailsEl,
                           this.onvisualizationtimechange);
  ui.onselect = this.handleCategorySelected_.bind(this);
  ui.onsizechange = this.oncategorysizechange;
  ui.setCurrentTime(0, initialLastNoteDuration, this.instrument.envelopeContour.releaseTime());
  this.categories.push(ui);
};

module.UI.prototype.createCategoryIndicator_ = function() {
  this.activeCategoryIndicatorEl = document.createElement('div');
  this.activeCategoryIndicatorEl.id = 'activeCategoryIndicator';
  this.categoriesEl.appendChild(this.activeCategoryIndicatorEl);
};

module.UI.prototype.createCategories_ = function(initialLastNoteDuration) {
  this.createCategoryUI_(PitchUI.UI, this.instrument.pitch, kPitchID, Strings.kPitch, initialLastNoteDuration);
  this.createCategoryUI_(OscillatorUI.UI, this.instrument.oscillators[0], kOscillatorAID, Strings.kOscillator1, initialLastNoteDuration);
  this.createCategoryUI_(OscillatorUI.UI, this.instrument.oscillators[1], kOscillatorBID, Strings.kOscillator2, initialLastNoteDuration);
  this.createCategoryUI_(OscillatorUI.UI, this.instrument.oscillators[2], kOscillatorCID, Strings.kOscillator3, initialLastNoteDuration);
  this.createCategoryUI_(FilterUI.UI, this.instrument.filters[0], kFilterAID, Strings.kFilter1, initialLastNoteDuration);
  this.createCategoryUI_(FilterUI.UI, this.instrument.filters[1], kFilterBID, Strings.kFilter2, initialLastNoteDuration);
  this.createCategoryUI_(EnvelopeUI.UI, this.instrument.envelopeContour, kEnvelopeID, Strings.kEnvelope, initialLastNoteDuration);
};

module.UI.prototype.handleCategorySelected_ = function(sender) {
  var categoriesUI = this;
  this.categories.forEach(function (ui) {
    categoriesUI.setCategorySelected_(ui, ui == sender);
  });
  this.onselectedcategorychange();
};

module.UI.prototype.setCategorySelected_ = function(categoryUI, selected) {
  categoryUI.setSelected(selected);
  if (selected) {
    this.activeCategoryIndicatorEl.style.left = UI.asPixels(categoryUI.categoryEl.offsetLeft);
    this.activeCategoryIndicatorEl.style.top = UI.asPixels(
        this.categoriesEl.offsetTop + this.categoriesEl.offsetHeight - this.activeCategoryIndicatorEl.offsetHeight);
  }
};

module.UI.prototype.selectCategoryWithID = function(id) {
  var categoriesUI = this;
  this.categories.forEach(function (ui) {
    categoriesUI.setCategorySelected_(ui, ui.id == id);
    ui.updateIcon();
  });
};

return module;

})();