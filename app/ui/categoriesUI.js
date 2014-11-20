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

module.UI.prototype.createPitchUI = function(id, title) {
  this.categories.push(new PitchUI.UI(
      id,
      this.instrument.pitch,
      this.instrument,
      title,
      this.categoriesEl,
      this.detailsEl,
      this.onvisualizationtimechange));
};

module.UI.prototype.createOscillatorUI = function(id, title, index) {
  this.categories.push(new OscillatorUI.UI(
      id,
      this.instrument.oscillators[index],
      this.instrument,
      title,
      this.categoriesEl,
      this.detailsEl,
      this.onvisualizationtimechange));
};

module.UI.prototype.createFilterUI = function(id, title, index) {
  this.categories.push(new FilterUI.UI(
      id,
      this.instrument.filters[index],
      this.scene.context,
      this.instrument,
      title,
      this.categoriesEl,
      this.detailsEl,
      this.onvisualizationtimechange));
};

module.UI.prototype.createEnvelopeUI = function(id, title) {
  this.categories.push(new EnvelopeUI.UI(
      id,
      this.instrument.envelopeContour,
      this.instrument,
      title,
      this.categoriesEl,
      this.detailsEl,
      this.onvisualizationtimechange));
};

module.UI.prototype.createCategoryIndicator = function() {
  this.activeCategoryIndicatorEl = document.createElement('div');
  this.activeCategoryIndicatorEl.id = 'activeCategoryIndicator';
  this.categoriesEl.appendChild(this.activeCategoryIndicatorEl);
};

module.UI.prototype.createCategories = function() {
  this.createPitchUI(kPitchID, Strings.kPitch);
  this.createOscillatorUI(kOscillatorAID, Strings.kOscillator1, 0);
  this.createOscillatorUI(kOscillatorBID, Strings.kOscillator2, 1);
  this.createOscillatorUI(kOscillatorCID, Strings.kOscillator3, 2);
  this.createFilterUI(kFilterAID, Strings.kFilter1, 0);
  this.createFilterUI(kFilterBID, Strings.kFilter2, 1);
  this.createEnvelopeUI(kEnvelopeID, Strings.kEnvelope);
}

return module;

})();