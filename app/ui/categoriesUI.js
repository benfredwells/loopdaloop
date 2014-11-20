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

module.UI = function(categoriesEl, detailsEl, instrument, scene, onvisualizationtimechange) {
  this.categoriesEl = categoriesEl;
  this.detailsEl = detailsEl;
  this.instrument = instrument;
  this.scene = scene;
  this.onvisualizationtimechange = onvisualizationtimechange;

  this.categoriesEl.tabIndex = 0;
  this.categories = [];
  this.createCategories();
  this.createCategoryIndicator();
}

module.UI.prototype.createCategoryUI = function(constructor, aspect, id, title) {
  this.categories.push(new constructor(id, aspect, this.scene.context, this.instrument,
                                       title, this.categoriesEl, this.detailsEl,
                                       this.onvisualizationtimechange));
};

module.UI.prototype.createCategoryIndicator = function() {
  this.activeCategoryIndicatorEl = document.createElement('div');
  this.activeCategoryIndicatorEl.id = 'activeCategoryIndicator';
  this.categoriesEl.appendChild(this.activeCategoryIndicatorEl);
};

module.UI.prototype.createCategories = function() {
  this.createCategoryUI(PitchUI.UI, this.instrument.pitch, kPitchID, Strings.kPitch);
  this.createCategoryUI(OscillatorUI.UI, this.instrument.oscillators[0], kOscillatorAID, Strings.kOscillator1);
  this.createCategoryUI(OscillatorUI.UI, this.instrument.oscillators[1], kOscillatorBID, Strings.kOscillator2);
  this.createCategoryUI(OscillatorUI.UI, this.instrument.oscillators[2], kOscillatorCID, Strings.kOscillator3);
  this.createCategoryUI(FilterUI.UI, this.instrument.filters[0], kFilterAID, Strings.kFilter1);
  this.createCategoryUI(FilterUI.UI, this.instrument.filters[1], kFilterBID, Strings.kFilter2);
  this.createCategoryUI(EnvelopeUI.UI, this.instrument.envelopeContour, kEnvelopeID, Strings.kEnvelope);
}

return module;

})();