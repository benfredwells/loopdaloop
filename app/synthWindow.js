"use strict";

(function() {
var kHeightPadding = 110;
var kWidth = 440;

var kDeadKeys = ['instrumentWindowExpandedField'];
var kSelectedCategoryKey = 'selectedCategoryField';
var kSelectedPresetKey = 'selectedPreset';

var kDefaultNoteDuration = 2;

var SynthesizerWrapper = function() {
  this.currentNote = null;
  this.lastNoteDuration = kDefaultNoteDuration;

  this.testButton = null;
  this.instrumentPersistUI = null;

  this.categoriesUI = null;
  this.instrument = gBackgroundPage.instrument;
  this.scene = gBackgroundPage.scene;
  this.savedInstruments = gBackgroundPage.savedInstruments;
};

SynthesizerWrapper.prototype.createInstrumentPersistUI = function() {
  this.instrumentPersistUI = new InstrumentPersistUI.UI(
      document.getElementById('instrumentPersist'),
      this.instrument,
      this.handleInstrumentChanged.bind(this));
}

// TODO: move this into instrument persist UI.
SynthesizerWrapper.prototype.createTestButton = function() {
  this.testButton = new TestButton.TestButton(
      this.instrumentPersistUI.div,
      this.instrument,
      this.scene,
      this.handleTestNoteTimeChange.bind(this));
};

SynthesizerWrapper.prototype.createErrorDisplayUI = function() {
  this.errorDisplayUI = new ErrorUI.UI(
      document.getElementById('errorDisplayHolder'),
      this.handleErrorVisibilityChanged.bind(this));
};

SynthesizerWrapper.prototype.initializeCategoryUI = function(ui) {
  ui.onselect = this.handleCategorySelected.bind(this);
  ui.onsizechange = this.handleCategorySizeChanged.bind(this);
  ui.setCurrentTime(0, this.lastNoteDuration, this.instrument.envelopeContour.releaseTime());
};

SynthesizerWrapper.prototype.handleSavedInstrumentsLoaded = function() {
  chrome.storage.local.remove(kDeadKeys);
  chrome.storage.local.get([kSelectedCategoryKey, kSelectedPresetKey], this.handleStorageLoaded.bind(this));
};

SynthesizerWrapper.prototype.handleLoad = function() {
  this.loaded = false;

  var categoriesEl = document.getElementById('categories');
  var detailsEl = document.getElementById('details');
  var visualizationTimeChangeHandler = this.handleVisualizationTimeChange.bind(this);
  
  this.categoriesUI = new CategoriesUI.UI(categoriesEl, detailsEl, this.instrument, this.scene, visualizationTimeChangeHandler);

  this.createInstrumentPersistUI();
  this.createTestButton();
  this.createErrorDisplayUI();
  this.savedInstruments.setErrorHandler(this.errorDisplayUI.updateErrorTextCallback);

  this.categoriesUI.categories.forEach(this.initializeCategoryUI.bind(this));
  this.testButton.setCurrentTime(0);

  gBackgroundPage.showKeyboard();
  gBackgroundPage.setSynthWrapper(this);
};

SynthesizerWrapper.prototype.setCategorySelected = function(categoryUI, selected) {
  categoryUI.setSelected(selected);
  if (selected) {
    this.categoriesUI.activeCategoryIndicatorEl.style.left = UI.asPixels(categoryUI.categoryEl.offsetLeft);
    this.categoriesUI.activeCategoryIndicatorEl.style.top = UI.asPixels(
        this.categoriesUI.categoriesEl.offsetTop + this.categoriesUI.categoriesEl.offsetHeight - this.categoriesUI.activeCategoryIndicatorEl.offsetHeight);
  }
}

SynthesizerWrapper.prototype.handleStorageLoaded = function(items) {
  this.instrumentPersistUI.initialize(this.savedInstruments);

  var selectedPresetName = items[kSelectedPresetKey];
  if (selectedPresetName)
    this.instrumentPersistUI.useNamedPreset(selectedPresetName);
  else
    this.handleInstrumentChanged();

  var selectedID = items[kSelectedCategoryKey];
  if (!selectedID)
    selectedID = kOscillatorAID;
  var wrapper = this;
  this.categoriesUI.categories.forEach(function (ui) {
    wrapper.setCategorySelected(ui, ui.id == selectedID);
    ui.updateIcon();
  });
  this.loaded = true;
  this.updateSize();
};

SynthesizerWrapper.prototype.handleInstrumentChanged = function() {
  this.categoriesUI.categories.forEach(function(ui) {
    ui.updateDisplay();
  });
  this.updateSize();
  this.saveState();
};

SynthesizerWrapper.prototype.handleVisualizationTimeChange = function(newTime) {
  if (newTime > this.lastNoteDuration + this.instrument.envelopeContour.releaseTime()) {
    newTime = this.lastNoteDuration + this.instrument.envelopeContour.releaseTime();
  }

  var win = this;
  this.categoriesUI.categories.forEach(function (ui) {
    ui.setCurrentTime(newTime, win.lastNoteDuration, win.instrument.envelopeContour.releaseTime());
  });
  this.testButton.setCurrentTime(newTime);
};

SynthesizerWrapper.prototype.handleTestNoteTimeChange = function(newTime, noteDuration, releaseTime) {
  this.lastNoteDuration = noteDuration;
  if (newTime > this.lastNoteDuration + releaseTime) {
    newTime = this.lastNoteDuration + releaseTime;
  }

  var win = this;
  this.categoriesUI.categories.forEach(function (ui) {
    ui.setCurrentTime(newTime, win.lastNoteDuration, releaseTime);
  });
};

SynthesizerWrapper.prototype.saveState = function() {
  var selectedID = '';
  this.categoriesUI.categories.forEach(function (ui) {
    if (ui.isSelected())
      selectedID = ui.id;
  });
  var setting = {};
  setting[kSelectedCategoryKey] = selectedID;
  setting[kSelectedPresetKey] = this.instrumentPersistUI.getCurrentPresetName();
  chrome.storage.local.set(setting);
};

SynthesizerWrapper.prototype.handleCategorySelected = function(sender) {
  var wrapper = this;
  this.categoriesUI.categories.forEach(function (ui) {
    wrapper.setCategorySelected(ui, ui == sender);
  });
  this.updateSize();
  this.saveState();
};

SynthesizerWrapper.prototype.handleCategorySizeChanged = function(sender) {
  this.updateSize();
};

SynthesizerWrapper.prototype.handleErrorVisibilityChanged = function(sender) {
  this.updateSize();
}

SynthesizerWrapper.prototype.updateSize = function() {
  if (!this.loaded)
    return;

  var height = 0;
  this.categoriesUI.categories.forEach(function(ui) {
    height = height + ui.height();
  });
  height = height + this.errorDisplayUI.height();
  height = height + kHeightPadding;
  var win = chrome.app.window.current();
  var bounds = {};
  bounds.left = null;
  bounds.top = null;
  bounds.width = kWidth + 6;
  bounds.height = height + 25;
  win.setBounds(bounds);
};

var synthesizerWindow = new SynthesizerWrapper();

window.onload = synthesizerWindow.handleLoad.bind(synthesizerWindow);

})();