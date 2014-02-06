"use strict";

// TODO: make this a class.

var gCurrentNote = null;
var gInstrumentUIs = [];
var gSavedInstruments = null;

var kHeightPadding = 100;
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

var kDefaultNoteDuration = 2;
var lastNoteDuration = kDefaultNoteDuration;

var gTestButton = null;
var gInstrumentPersistUI = null;

function visualizationTimeChange(newTime) {
  if (newTime > lastNoteDuration + gBackgroundPage.instrument.envelopeContour.releaseTime()) {
    newTime = lastNoteDuration + gBackgroundPage.instrument.envelopeContour.releaseTime();
  }
  gInstrumentUIs.forEach(function (ui) {
    ui.setCurrentTime(newTime, lastNoteDuration, gBackgroundPage.instrument.envelopeContour.releaseTime());
  });
  gTestButton.setCurrentTime(newTime);
}

function testNoteTimeChange(newTime, noteDuration, releaseTime) {
  lastNoteDuration = noteDuration;
  if (newTime > lastNoteDuration + releaseTime) {
    newTime = lastNoteDuration + releaseTime;
  }
  gInstrumentUIs.forEach(function (ui) {
    ui.setCurrentTime(newTime, lastNoteDuration, releaseTime);
  });
}

function init() {
  // Instrument UI setup
  var categoriesEl = document.getElementById('categories');
  var detailsEl = document.getElementById('details');
  gInstrumentUIs.push(new PitchUI.UI(
      kPitchID,
      gBackgroundPage.instrument.pitch,
      gBackgroundPage.instrument,
      Strings.kPitch,
      categoriesEl,
      detailsEl,
      visualizationTimeChange));
  gInstrumentUIs.push(new OscillatorUI.UI(
      kOscillatorAID,
      gBackgroundPage.instrument.oscillators[0],
      gBackgroundPage.instrument,
      Strings.kOscillator1,
      categoriesEl,
      detailsEl,
      visualizationTimeChange));
  gInstrumentUIs.push(new OscillatorUI.UI(
      kOscillatorBID,
      gBackgroundPage.instrument.oscillators[1],
      gBackgroundPage.instrument,
      Strings.kOscillator2,
      categoriesEl,
      detailsEl,
      visualizationTimeChange));
  gInstrumentUIs.push(new OscillatorUI.UI(
      kOscillatorCID,
      gBackgroundPage.instrument.oscillators[2],
      gBackgroundPage.instrument,
      Strings.kOscillator3,
      categoriesEl,
      detailsEl,
      visualizationTimeChange));
  gInstrumentUIs.push(new FilterUI.UI(
      kFilterAID,
      gBackgroundPage.instrument.filters[0],
      gBackgroundPage.scene.context,
      gBackgroundPage.instrument,
      Strings.kFilter1,
      categoriesEl,
      detailsEl,
      visualizationTimeChange));
  gInstrumentUIs.push(new FilterUI.UI(
      kFilterBID,
      gBackgroundPage.instrument.filters[1],
      gBackgroundPage.scene.context,
      gBackgroundPage.instrument,
      Strings.kFilter2,
      categoriesEl,
      detailsEl,
      visualizationTimeChange));
  gInstrumentUIs.push(new EnvelopeUI.UI(
      kEnvelopeID,
      gBackgroundPage.instrument.envelopeContour,
      gBackgroundPage.instrument,
      Strings.kEnvelope,
      categoriesEl,
      detailsEl,
      visualizationTimeChange));

  var headerEl = document.getElementById('header');
  gTestButton = new TestButton.Button(headerEl, gBackgroundPage.instrument, gBackgroundPage.scene, testNoteTimeChange);

  gInstrumentUIs.forEach(function(ui) {
    ui.onselect = categorySelected;
    ui.onsizechange = categorySizeChanged;
    ui.setCurrentTime(0, lastNoteDuration, gBackgroundPage.instrument.envelopeContour.releaseTime());
  });
  gTestButton.setCurrentTime(0);

  var instrumentChanged = function() {
    gInstrumentUIs.forEach(function(ui) {
      ui.updateDisplay();
    });
    updateSize();
  };
  gInstrumentPersistUI = new InstrumentPersistUI.UI(document.getElementById('instrumentPersist'),
                                                    gBackgroundPage.instrument, instrumentChanged); 

  var initializeInstrument = function() {
    gSavedInstruments.default.updateInstrument(gBackgroundPage.instrument);
    instrumentChanged();
    gInstrumentPersistUI.initialize(gSavedInstruments);
  };
  gSavedInstruments = new SavedInstruments.Manager(initializeInstrument);

  chrome.storage.local.remove(kDeadKeys);
  chrome.storage.local.get(kSelectedCategoryKey, function(items) {
    var selectedID = items[kSelectedCategoryKey];
    if (!selectedID)
      selectedID = kOscillatorAID;
    gInstrumentUIs.forEach(function (ui) {
      ui.setSelected(ui.id == selectedID);
      ui.updateIcon();
    });
    updateSize();
  });

  gBackgroundPage.showKeyboard();
}

function saveState() {
  var selectedID = '';
  gInstrumentUIs.forEach(function (ui) {
    if (ui.isSelected())
      selectedID = ui.id;
  });
  var setting = {};
  setting[kSelectedCategoryKey] = selectedID;
  chrome.storage.local.set(setting);
}

function categorySelected(sender) {
  gInstrumentUIs.forEach(function (ui) {
    if (ui != sender) {
      ui.setSelected(false);
    }
  });
  updateSize();
  saveState();
}

function categorySizeChanged(sender) {
  updateSize();
}

function updateSize() {
  var height = 0;
  gInstrumentUIs.forEach(function(ui) {
    height = height + ui.height();
  });
  height = height + kHeightPadding;
  var win = chrome.app.window.current();
  var bounds = win.getBounds();
  bounds.width = kWidth;
  bounds.height = height;
  win.setBounds(bounds);
}

window.onload = init;