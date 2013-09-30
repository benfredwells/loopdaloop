"use strict";

// TODO: make this a class.

var gContext = null;
var gCurrentNote = null;
var gInstrumentUIs = [];
var gInstrument = null;

var kOutputGain = 0.01;

var kHeightPadding = 92;
var kWidth = 444;
var kCompressorThreshold = -30;
var kCompressorKnee = 10;
var kCompressorAttack = 0.01;
var kCompressorRelease = 1;

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

function visualizationTimeChange(newTime) {
  if (newTime > lastNoteDuration + gInstrument.envelopeContour.releaseTime()) {
    newTime = lastNoteDuration + gInstrument.envelopeContour.releaseTime();
  }
  gInstrumentUIs.forEach(function (ui) {
    ui.setCurrentTime(newTime, lastNoteDuration, gInstrument.envelopeContour.releaseTime());
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
  gContext = new webkitAudioContext();
  var compressor = gContext.createDynamicsCompressor();
  compressor.threshold.value = kCompressorThreshold;
  compressor.knee.value = kCompressorKnee;
  compressor.attack.value = kCompressorAttack;
  compressor.release.value = kCompressorRelease;
  compressor.connect(gContext.destination);
  var gainNode = gContext.createGainNode();
  gainNode.gain.value = kOutputGain;
  gainNode.connect(compressor);
  gInstrument = new Instrument.Instrument(gContext, gainNode);
  InstrumentState.updateInstrument(gInstrument, DefaultInstrumentState.Default());

  // Instrument UI setup
  var categoriesEl = document.getElementById('categories');
  var detailsEl = document.getElementById('details');
  gInstrumentUIs.push(new OscillatorUI.UI(
      kOscillatorAID,
      gInstrument.oscillators[0],
      gInstrument,
      Strings.kOscillator1,
      categoriesEl,
      detailsEl,
      visualizationTimeChange));
  gInstrumentUIs.push(new OscillatorUI.UI(
      kOscillatorBID,
      gInstrument.oscillators[1],
      gInstrument,
      Strings.kOscillator2,
      categoriesEl,
      detailsEl,
      visualizationTimeChange));
  gInstrumentUIs.push(new OscillatorUI.UI(
      kOscillatorCID,
      gInstrument.oscillators[2],
      gInstrument,
      Strings.kOscillator3,
      categoriesEl,
      detailsEl,
      visualizationTimeChange));
  gInstrumentUIs.push(new FilterUI.UI(
      kFilterAID,
      gInstrument.filters[0],
      gInstrument,
      Strings.kFilter1,
      categoriesEl,
      detailsEl,
      visualizationTimeChange));
  gInstrumentUIs.push(new FilterUI.UI(
      kFilterBID,
      gInstrument.filters[1],
      gInstrument,
      Strings.kFilter2,
      categoriesEl,
      detailsEl,
      visualizationTimeChange));
  gInstrumentUIs.push(new EnvelopeUI.UI(
      kEnvelopeID,
      gInstrument.envelopeContour,
      gInstrument,
      Strings.kEnvelope,
      categoriesEl,
      detailsEl,
      visualizationTimeChange));

  var headerEl = document.getElementById('header');
  gTestButton = new TestButton.Button(headerEl, gInstrument, gContext, testNoteTimeChange);

  gInstrumentUIs.forEach(function (ui) {
    ui.onselect = categorySelected;
    ui.onsizechange = categorySizeChanged;
    ui.setCurrentTime(0, lastNoteDuration, gInstrument.envelopeContour.releaseTime());
  });
  gTestButton.setCurrentTime(0);

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

// Defined by background page.
  window.showKeyboard();
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