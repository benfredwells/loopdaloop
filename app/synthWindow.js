"use strict";

// TODO: make this a class.

var gContext = null;
var gCurrentNote = null;
var gInstrumentUIs = [];
var gInstrument = null;

var kOutputGain = 0.01;

var kHeightPadding = 100;
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

var kDefaultNoteOnTime = 2;

function timeChange(newTime) {
  gInstrumentUIs.forEach(function (ui) {
    ui.setCurrentTime(newTime, kDefaultNoteOnTime, gInstrument.envelopeContour.releaseTime());
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
      timeChange));
  gInstrumentUIs.push(new OscillatorUI.UI(
      kOscillatorBID,
      gInstrument.oscillators[1],
      gInstrument,
      Strings.kOscillator2,
      categoriesEl,
      detailsEl,
      timeChange));
  gInstrumentUIs.push(new OscillatorUI.UI(
      kOscillatorCID,
      gInstrument.oscillators[2],
      gInstrument,
      Strings.kOscillator3,
      categoriesEl,
      detailsEl,
      timeChange));
  gInstrumentUIs.push(new FilterUI.UI(
      kFilterAID,
      gInstrument.filters[0],
      gInstrument,
      Strings.kFilter1,
      categoriesEl,
      detailsEl,
      timeChange));
  gInstrumentUIs.push(new FilterUI.UI(
      kFilterBID,
      gInstrument.filters[1],
      gInstrument,
      Strings.kFilter2,
      categoriesEl,
      detailsEl,
      timeChange));
  gInstrumentUIs.push(new EnvelopeUI.UI(
      kEnvelopeID,
      gInstrument.envelopeContour,
      gInstrument,
      Strings.kEnvelope,
      categoriesEl,
      detailsEl,
      timeChange));

  var headerEl = document.getElementById('header');
  new TestButton.Button(headerEl, gInstrument);

  gInstrumentUIs.forEach(function (ui) {
    ui.onclicked = categoryClicked;
    ui.setCurrentTime(0, kDefaultNoteOnTime, gInstrument.envelopeContour.releaseTime());
    updateSize();
  });

  chrome.storage.local.remove(kDeadKeys);
  chrome.storage.local.get(kSelectedCategoryKey, function(items) {
    var selectedID = items[kSelectedCategoryKey];
    if (!selectedID)
      selectedID = kOscillatorAID;
    gInstrumentUIs.forEach(function (ui) {
      ui.setSelected(ui.id == selectedID);
    });
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

function categoryClicked(sender) {
  gInstrumentUIs.forEach(function (ui) {
    if (ui != sender) {
      ui.setSelected(false);
    }
  });
  updateSize();
  saveState();
}

function updateSize() {
  //var height = 0;
  //gInstrumentUIs.forEach(function(ui) {
  //  height = height + ui.element.clientHeight;
  //});
  //height = height + kHeightPadding;
  //window.resizeTo(window.outerWidth, height);
}

window.onload = init;