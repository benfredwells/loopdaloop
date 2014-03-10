"use strict";

(function() {
var kHeightPadding = 110;
var kWidth = 440;

var kPitchID = 'pitch';
var kOscillatorAID = 'oscillatora';
var kOscillatorBID = 'oscillatorb';
var kOscillatorCID = 'oscillatorc';
var kFilterAID = 'fitlera';
var kFilterBID = 'filterb';
var kEnvelopeID = 'envelope';

var kDeadKeys = ['instrumentWindowExpandedField'];
var kSelectedCategoryKey = 'selectedCategoryField';
var kSelectedPresetKey = 'selectedPreset';

var kDefaultNoteDuration = 2;

var SynthesizerWrapper = function() {
  this.currentNote = null;
  this.lastNoteDuration = kDefaultNoteDuration;

  this.testButton = null;
  this.instrumentUIs = [];
  this.instrumentPersistUI = null;

  this.categoriesEl = null;
  this.detailsEl = null;
  this.instrument = gBackgroundPage.instrument;
  this.scene = gBackgroundPage.scene;
  this.savedInstruments = gBackgroundPage.savedInstruments;
};

SynthesizerWrapper.prototype.createPitchUI = function(id, title) {
  this.instrumentUIs.push(new PitchUI.UI(
      id,
      this.instrument.pitch,
      this.instrument,
      title,
      this.categoriesEl,
      this.detailsEl,
      this.handleVisualizationTimeChange.bind(this)));
};

SynthesizerWrapper.prototype.createOscillatorUI = function(id, title, index) {
  this.instrumentUIs.push(new OscillatorUI.UI(
      id,
      this.instrument.oscillators[index],
      this.instrument,
      title,
      this.categoriesEl,
      this.detailsEl,
      this.handleVisualizationTimeChange.bind(this)));
};

SynthesizerWrapper.prototype.createFilterUI = function(id, title, index) {
  this.instrumentUIs.push(new FilterUI.UI(
      id,
      this.instrument.filters[index],
      this.scene.context,
      this.instrument,
      title,
      this.categoriesEl,
      this.detailsEl,
      this.handleVisualizationTimeChange.bind(this)));
};

SynthesizerWrapper.prototype.createEnvelopeUI = function(id, title) {
  this.instrumentUIs.push(new EnvelopeUI.UI(
      id,
      this.instrument.envelopeContour,
      this.instrument,
      title,
      this.categoriesEl,
      this.detailsEl,
      this.handleVisualizationTimeChange.bind(this)));
};

SynthesizerWrapper.prototype.createTestButton = function() {
  var headerEl = document.getElementById('header');
  this.testButton = new TestButton.Button(
      headerEl,
      this.instrument,
      this.scene,
      this.handleTestNoteTimeChange.bind(this));
};

SynthesizerWrapper.prototype.createInstrumentPersistUI = function() {
  this.instrumentPersistUI = new InstrumentPersistUI.UI(
      document.getElementById('instrumentPersist'),
      this.instrument,
      this.handleInstrumentChanged.bind(this));
}

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
  this.categoriesEl = document.getElementById('categories');
  this.detailsEl = document.getElementById('details');

  this.createPitchUI(kPitchID, Strings.kPitch);
  this.createOscillatorUI(kOscillatorAID, Strings.kOscillator1, 0);
  this.createOscillatorUI(kOscillatorBID, Strings.kOscillator2, 1);
  this.createOscillatorUI(kOscillatorCID, Strings.kOscillator3, 2);
  this.createFilterUI(kFilterAID, Strings.kFilter1, 0);
  this.createFilterUI(kFilterBID, Strings.kFilter2, 1);
  this.createEnvelopeUI(kEnvelopeID, Strings.kEnvelope);

  this.createTestButton();
  this.createInstrumentPersistUI();
  this.createErrorDisplayUI();
  this.savedInstruments.setErrorHandler(this.errorDisplayUI.updateErrorTextCallback);

  this.instrumentUIs.forEach(this.initializeCategoryUI.bind(this));
  this.testButton.setCurrentTime(0);

  gBackgroundPage.showKeyboard();
  gBackgroundPage.setSynthWrapper(this);
};

SynthesizerWrapper.prototype.handleStorageLoaded = function(items) {
  this.instrumentPersistUI.initialize(this.savedInstruments);

  var selectedPresetName = items[kSelectedPresetKey];
  console.log('restoring ' + selectedPresetName);
  if (selectedPresetName)
    this.instrumentPersistUI.useNamedPreset(selectedPresetName);
  else
    this.handleInstrumentChanged();

  var selectedID = items[kSelectedCategoryKey];
  if (!selectedID)
    selectedID = kOscillatorAID;
  this.instrumentUIs.forEach(function (ui) {
    ui.setSelected(ui.id == selectedID);
    ui.updateIcon();
  });
  this.updateSize();
};

SynthesizerWrapper.prototype.handleInstrumentChanged = function() {
  this.instrumentUIs.forEach(function(ui) {
    ui.updateDisplay();
  });
  this.updateSize();
};

SynthesizerWrapper.prototype.handleVisualizationTimeChange = function(newTime) {
  if (newTime > this.lastNoteDuration + this.instrument.envelopeContour.releaseTime()) {
    newTime = this.lastNoteDuration + this.instrument.envelopeContour.releaseTime();
  }

  var win = this;
  this.instrumentUIs.forEach(function (ui) {
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
  this.instrumentUIs.forEach(function (ui) {
    ui.setCurrentTime(newTime, win.lastNoteDuration, releaseTime);
  });
};

SynthesizerWrapper.prototype.saveState = function() {
  var selectedID = '';
  this.instrumentUIs.forEach(function (ui) {
    if (ui.isSelected())
      selectedID = ui.id;
  });
  var setting = {};
  setting[kSelectedCategoryKey] = selectedID;
  setting[kSelectedPresetKey] = this.instrumentPersistUI.getCurrentPresetName();
  console.log('saving ' + setting[kSelectedPresetKey]);
  chrome.storage.local.set(setting);
};

SynthesizerWrapper.prototype.handleCategorySelected = function(sender) {
  this.instrumentUIs.forEach(function (ui) {
    if (ui != sender) {
      ui.setSelected(false);
    }
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
  var height = 0;
  this.instrumentUIs.forEach(function(ui) {
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